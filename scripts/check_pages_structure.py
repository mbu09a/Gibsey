#!/usr/bin/env python3
"""Check the structure of the pages table in Supabase.
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
    # Get sample row with all fields
    sample_row = sb.table("pages").select("*").limit(1).execute()

    if sample_row.data:
        print("Pages table structure:")
        for key in sample_row.data[0].keys():
            print(f"- {key}")

        # Show sample row content
        print("\nSample row:")
        for key, value in sample_row.data[0].items():
            # Truncate long values
            if isinstance(value, str) and len(value) > 100:
                print(f"{key}: {value[:100]}... (truncated)")
            elif isinstance(value, list) and len(str(value)) > 100:
                print(f"{key}: [list with {len(value)} items]")
            else:
                print(f"{key}: {value}")
    else:
        print("No rows found in the pages table.")

except Exception as e:
    print(f"Error: {e}")
    print("The 'pages' table may not exist or there might be connection issues.")
