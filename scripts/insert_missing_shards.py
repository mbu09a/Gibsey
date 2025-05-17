#!/usr/bin/env python3
"""Insert missing shards to the pages table.
This script inserts shards 2-33 with null embeddings, allowing embed_seed.py to then embed them.
"""
import os
import sys

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
SB_URL = os.getenv("SUPABASE_URL")
SB_KEY = os.getenv("SUPABASE_ANON_KEY")
if not (SB_URL and SB_KEY):
    sys.exit("🛑  Missing env vars (SUPABASE_URL, SUPABASE_ANON_KEY)")

sb = create_client(SB_URL, SB_KEY)

# First check how many shards we already have
existing = sb.table("pages").select("id").order("id").execute()
existing_ids = [row["id"] for row in existing.data]
print(f"Found {len(existing_ids)} existing shards with IDs: {existing_ids}")

# Generate sample shards (in a real scenario, these would be actual content fragments)
for i in range(2, 34):  # 2 through 33
    if i in existing_ids:
        print(f"Shard {i} already exists, skipping")
        continue

    shard_data = {
        "id": i,
        "title": f"An Author's Preface — Shard {i}",
        "content": f"This is sample content for shard {i}. In a real scenario, this would be an actual fragment of the author's preface.",
        "symbol_id": 1,  # Using symbol 1 for all shards as a default
        "embedding": None,  # Start with null embedding
    }

    result = sb.table("pages").insert(shard_data).execute()
    print(f"Inserted shard {i} successfully")

print("✅ Done - All missing shards have been inserted with null embeddings")
