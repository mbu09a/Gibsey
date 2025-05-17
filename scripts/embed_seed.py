#!/usr/bin/env python3
"""Embed any pages whose embedding is NULL.
usage: embed_seed.py [--dry] [--batch 10]
"""
import argparse
import json
import math
import os
import sys
import time

from dotenv import load_dotenv
from openai import APIError, OpenAI
from supabase import create_client

MODEL = "text-embedding-3-small"
PRICE_PER_1K = 0.00002  # USD for small model

load_dotenv()
SB_URL = os.getenv("SUPABASE_URL")
SB_KEY = os.getenv("SUPABASE_ANON_KEY")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not (SB_URL and SB_KEY and OPENAI_KEY):
    sys.exit("🛑  Missing env vars (SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY)")

sb = create_client(SB_URL, SB_KEY)
client = OpenAI(api_key=OPENAI_KEY)

parser = argparse.ArgumentParser()
parser.add_argument(
    "--dry", action="store_true", help="don't call OpenAI, just estimate cost"
)
parser.add_argument("--batch", type=int, default=10)
args = parser.parse_args()

rows = (
    sb.table("pages")
    .select("id, content")
    .is_("embedding", "null")
    .limit(1000)
    .execute()
    .data
)
print(f"🔎 {len(rows)} rows need embeddings")

total_tokens = 0
for i in range(0, len(rows), args.batch):
    chunk = rows[i : i + args.batch]
    texts = [r["content"] for r in chunk]
    if args.dry:
        # rough 1 token ≈ 4 chars
        tokens = sum(math.ceil(len(t) / 4) for t in texts)
        total_tokens += tokens
        continue
    backoff = 1
    while True:
        try:
            resp = client.embeddings.create(model=MODEL, input=texts)
            break
        except APIError:
            print(f"OpenAI error → retry in {backoff}s")
            time.sleep(backoff)
            backoff = min(backoff * 2, 60)
    total_tokens += resp.usage.total_tokens
    for r, emb in zip(chunk, resp.data):
        sb.table("pages").update({"embedding": emb.embedding}).eq(
            "id", r["id"]
        ).execute()
        print(f"· id {r['id']} embedded (dims={len(emb.embedding)})")

usd = (total_tokens / 1000) * PRICE_PER_1K
print(json.dumps({"tokens": total_tokens, "usd_estimate": round(usd, 4)}, indent=2))
