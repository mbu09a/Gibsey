#!/usr/bin/env python3
"""Check if the vault table exists and contains shards.
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

try:
    # Check if the vault table exists
    vault_count_result = sb.table("vault").select("count", count="exact").execute()
    total_vault_rows = vault_count_result.count
    print(f"Vault table exists with {total_vault_rows} total rows")

    # Get sample structure
    if total_vault_rows > 0:
        sample_row = sb.table("vault").select("*").limit(1).execute()

        print("\nVault table structure:")
        for key in sample_row.data[0].keys():
            print(f"- {key}")

        # Count rows with embeddings
        if "embedding" in sample_row.data[0].keys():
            vault_with_embeddings = (
                sb.table("vault")
                .select("count", count="exact")
                .not_.is_("embedding", "null")
                .execute()
            )
            print(f"\nRows with embeddings: {vault_with_embeddings.count}")

except Exception as e:
    print(f"Error checking vault table: {e}")
    print("The 'vault' table may not exist or there might be connection issues.")

# List all tables in the database
try:
    # This is a raw SQL query to list all tables
    tables_result = (
        sb.table("pg_catalog.pg_tables")
        .select("tablename")
        .eq("schemaname", "public")
        .execute()
    )

    print("\nAll public tables in the database:")
    for table in tables_result.data:
        print(f"- {table['tablename']}")

except Exception as e:
    print(f"Error listing tables: {e}")
    print("Unable to list tables in the database.")
