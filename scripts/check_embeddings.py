#!/usr/bin/env python3
"""Check the state of embeddings in the Supabase 'pages' table.
"""
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
SB_URL = os.getenv("SUPABASE_URL")
SB_KEY = os.getenv("SUPABASE_ANON_KEY")

if not (SB_URL and SB_KEY):
    print("🛑 Missing env vars (SUPABASE_URL, SUPABASE_ANON_KEY)")
    exit(1)

# Create Supabase client
sb = create_client(SB_URL, SB_KEY)

# 1. Check if "pages" table exists
try:
    # Query to get total rows
    total_count_result = sb.table("pages").select("count", count="exact").execute()
    total_rows = total_count_result.count
    print(f"1. Pages table exists with {total_rows} total rows")

    # 2. Count how many rows have non-null embeddings
    embedding_count_result = (
        sb.table("pages")
        .select("count", count="exact")
        .not_.is_("embedding", "null")
        .execute()
    )
    rows_with_embeddings = embedding_count_result.count
    print(f"2. Rows with embeddings: {rows_with_embeddings}")

    # 3. Count how many rows have null embeddings
    null_embedding_count_result = (
        sb.table("pages")
        .select("count", count="exact")
        .is_("embedding", "null")
        .execute()
    )
    rows_without_embeddings = null_embedding_count_result.count
    print(f"3. Rows without embeddings: {rows_without_embeddings}")

    # 4. Verify if total is 33 shards as expected
    if total_rows == 33:
        print("4. Total confirms expected 33 shards: ✅")
    else:
        print(f"4. Total DOES NOT match expected 33 shards: ❌ (found {total_rows})")

    print(f"\nSummary: {rows_with_embeddings}/{total_rows} rows have embeddings")

except Exception as e:
    print(f"Error: {e}")
    print("The 'pages' table may not exist or there might be connection issues.")
