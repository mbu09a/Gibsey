#!/usr/bin/env python3
"""Check for shard-related data in the Supabase database.
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

# Check potential table names
potential_tables = ["shards", "symbols", "pages", "chapters", "sections"]

for table_name in potential_tables:
    try:
        # Query to get total rows
        result = sb.table(table_name).select("count", count="exact").execute()
        count = result.count

        print(f"✅ Table '{table_name}' exists with {count} row(s)")

        # If table exists, check for a sample row
        if count > 0:
            sample = sb.table(table_name).select("*").limit(1).execute()
            print(f"  Fields: {', '.join(sample.data[0].keys())}")

            # Check if this table might contain shards
            if "title" in sample.data[0] and "content" in sample.data[0]:
                print("  This table appears to contain content that could be shards")

                # Get all rows to see if there are 33 shards
                all_rows = sb.table(table_name).select("id, title").execute()
                print(f"  All rows in {table_name}:")
                for row in all_rows.data:
                    print(f"  - ID {row['id']}: {row['title']}")

    except Exception as e:
        print(
            f"❌ Table '{table_name}' does not exist or query error: {str(e)[:100]}..."
        )
