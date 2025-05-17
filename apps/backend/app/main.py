import datetime as dt
import json
import pathlib
import sys
import textwrap

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from openai import APIError
from starlette.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .db import Supabase
from .metrics import instrument
from .schemas import AskRequest, AskResponse, VaultEntry, VaultSaveRequest
from .vector import get_openai_client, similar_pages

app = FastAPI(
    title="Gibsey Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Gibsey Backend API is running!",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi_schema": "/openapi.json",
    }


# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://localhost:8000",  # Backend
        "http://127.0.0.1:8000",  # Backend alternative
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Debug endpoint to list all routes
@app.get("/routes")
async def list_routes():
    routes = []
    for route in app.routes:
        if hasattr(route, "methods"):
            routes.append(
                {
                    "path": route.path,
                    "methods": sorted(list(route.methods)),
                    "name": getattr(route, "name", ""),
                    "endpoint": (
                        getattr(route, "endpoint", "").__name__
                        if hasattr(route, "endpoint")
                        else ""
                    ),
                }
            )
    return {"routes": routes}


@app.get("/health")
async def health(settings: Settings = Depends(get_settings)):
    return {"status": "ok", "env": settings.env}


@app.get("/debug")
async def debug():
    import os

    # Get the absolute path of the current file
    current_file = os.path.abspath(__file__)

    # Read the first 100 lines of the file
    file_content = []
    try:
        with open(current_file, "r") as f:
            file_content = [
                f"{i+1}: {line.rstrip()}" for i, line in enumerate(f) if i < 100
            ]
    except Exception as e:
        file_content = [f"Error reading file: {str(e)}"]

    return {
        "current_file": current_file,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "file_exists": os.path.exists(current_file),
        "file_content": "\n".join(file_content),
    }


@app.get("/read")
async def read_page(id: int = Query(..., gt=0)):
    page = (
        Supabase.client()
        .table("pages")
        .select("id,title,content,symbol_id")
        .eq("id", id)
        .single()
        .execute()
        .data
    )
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


# OpenAI model name constant
OPENAI_MODEL = "gpt-4o"


@app.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest, response: Response):
    """Handle questions using RAG with GPT-4o and vector search."""
    try:
        # 1. Fetch similar shards using vector search
        hits = similar_pages(req.question, k=req.k or 3)

        # Create context from top hits
        context = "\n---\n".join(
            f"Page {h['page_id']}: {textwrap.shorten(h.get('content', ''), 200, placeholder='...')}"
            for h in hits
        )

        # 2. Build the prompt for GPT-4o
        system_msg = (
            "You are the narrator of a metafictional novel called Gibsey. "
            "Answer in ≤120 words, remain poetic but precise.\n\n"
            f"Context:\n{context}\n\nQuestion: {req.question}"
        )

        # 3. Call GPT-4o with instrumentation
        client = get_openai_client()

        @instrument(OPENAI_MODEL)
        def _chat_completion():
            return client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "user", "content": system_msg}],
                temperature=0.7,
                max_tokens=160,
            )

        try:
            resp = _chat_completion()
            answer = resp.choices[0].message.content.strip()
            metrics = resp._metrics  # Get metrics from the decorator

        except APIError as e:
            response.status_code = 503
            return {
                "answer": "Gibsey is momentarily lost in the dream fog. Try again shortly.",
                "metadata": {"error": str(e), "model": OPENAI_MODEL},
            }

        # 4. Add observability headers
        response.headers.update(
            {
                "X-Latency-MS": str(metrics["elapsed_ms"]),
                "X-Prompt-Tokens": str(metrics["prompt_tokens"]),
                "X-Completion-Tokens": str(metrics["completion_tokens"]),
                "X-Cost-USD": str(metrics["cost_usd"]),
            }
        )

        # 5. Return the response
        return {
            "answer": answer,
            "metadata": {
                "model": OPENAI_MODEL,
                "context_pages": [h["page_id"] for h in hits],
                "tokens_used": metrics["prompt_tokens"] + metrics["completion_tokens"],
                "response_time_ms": metrics["elapsed_ms"],
                "cost_usd": metrics["cost_usd"],
                "error": None,
            },
        }

    except Exception as e:
        error_msg = str(e)
        print(f"Error in /ask endpoint: {error_msg}")
        response.status_code = 500

        # Log the error
        log_dir = pathlib.Path("logs")
        log_dir.mkdir(exist_ok=True)
        log_entry = {
            "timestamp": dt.datetime.utcnow().isoformat(),
            "question": req.question if "req" in locals() else "Unknown",
            "error": error_msg,
            "type": "error",
        }
        log_file = log_dir / f"errors-{dt.date.today()}.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")

        return {
            "answer": "I'm sorry, I encountered an error while processing your question. Please try again later.",
            "metadata": {
                "model": OPENAI_MODEL,
                "context_pages": [],
                "tokens_used": 0,
                "error": error_msg,
            },
        }


@app.get("/vault/list", response_model=list[VaultEntry])
async def list_vault_entries(
    page: int = Query(1, gt=0, description="Page number, starting from 1"),
    limit: int = Query(
        20, gt=0, le=100, description="Number of items per page, max 100"
    ),
):
    """
    List vault entries with pagination.
    Returns the most recent entries first.
    """
    try:
        offset = (page - 1) * limit
        response = (
            Supabase.client()
            .table("vault")
            .select("id, question, answer, created_at")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching vault entries: {str(e)}"
        )


@app.post("/vault/save", status_code=201)
async def save_to_vault(req: VaultSaveRequest):
    Supabase.client().table("vault").insert(
        {
            "page_id": req.page_id,
            "question": req.question,
            "answer": req.answer,
        }
    ).execute()
    return {"ok": True}
