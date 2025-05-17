#!/usr/bin/env python3
"""List all tables in the Supabase database using raw SQL query.
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
    # Raw SQL query to list all tables
    result = sb.rpc("list_tables", {}).execute()

    print("All tables in the database:")
    if result.data:
        for item in result.data:
            print(f"- {item}")
    else:
        print("No data returned or no tables found.")

except Exception as e:
    print(f"Error using RPC: {e}")

    # Try a different approach with raw SQL
    try:
        result = sb.from_("_rpc").rpc("list_tables").execute()
        print("\nResult from alternative approach:")
        print(result.data)
    except Exception as e2:
        print(f"Second approach also failed: {e2}")

        # Try a direct SQL query as a last resort
        try:
            result = sb.table("pages").select("*").limit(1).execute()
            print("\nPages table exists and contains data:")
            print(f"Table exists with {len(result.data)} row(s) returned in sample.")
        except Exception as e3:
            print(f"Final check failed: {e3}")
            print("Unable to determine table structure.")
