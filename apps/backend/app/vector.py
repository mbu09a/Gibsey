import os
from typing import Dict, List, Optional

from openai import OpenAI
from supabase import Client

from .config import get_settings
from .db import Supabase

MODEL = "text-embedding-3-small"

# Default client for production use
_default_client = None


def get_openai_client() -> OpenAI:
    """Get the OpenAI client, creating it if it doesn't exist."""
    global _default_client
    if _default_client is None:
        _default_client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY") or get_settings().openai_api_key,
            timeout=30.0,  # Add a timeout to prevent hanging
        )
    return _default_client


def _embed(text: str, client: Optional[OpenAI] = None) -> List[float]:
    """Return OpenAI embedding vector for the query string.

    Args:
        text: The text to embed
        client: Optional OpenAI client to use (for testing)
    """
    if client is None:
        client = get_openai_client()
    resp = client.embeddings.create(model=MODEL, input=text)
    return resp.data[0].embedding


def similar_pages(
    query: str, k: int = 3, client: Optional[OpenAI] = None
) -> List[Dict]:
    """Return top‑k pages ordered by cosine similarity.

    Args:
        query: The text to find similar pages for
        k: Number of results to return (default: 3)
        client: Optional OpenAI client to use (for testing)

    Returns:
        List of dicts with id, title, content and similarity score
    """
    vec = _embed(query, client=client)
    sb: Client = Supabase.client()

    try:
        # Execute the RPC call and get the response
        response = sb.rpc(
            "match_pages",  # Postgres function for vector similarity
            {"query_embedding": vec, "match_k": k},
        ).execute()

        # Ensure each result has a page_id field
        results = response.data or []
        for result in results:
            if "page_id" not in result and "id" in result:
                result["page_id"] = result["id"]

        return results

    except Exception as e:
        print(f"Error in similar_pages: {str(e)}")
        return []  # Return empty list on error
