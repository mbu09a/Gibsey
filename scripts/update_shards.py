#!/usr/bin/env python3
"""
Update the shards in the database with the correct multi-line content.
"""
import os

from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()
SB_URL = os.getenv("SUPABASE_URL")
SB_KEY = os.getenv("SUPABASE_ANON_KEY")

if not (SB_URL and SB_KEY):
    print("🛑 Missing env vars (SUPABASE_URL, SUPABASE_ANON_KEY)")
    exit(1)

# Initialize Supabase client
sb = create_client(SB_URL, SB_KEY)


def parse_shards_file(filepath):
    """Parse the shards file into a list of (id, content) tuples."""
    print(f"Reading file: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"File content length: {len(content)} characters")
    print("First 100 chars:", content[:100])

    # Split content into lines
    lines = content.split("\n")
    print(f"Found {len(lines)} lines in file")

    shards = []
    current_id = None
    current_content = []

    for i, line in enumerate(lines, 1):
        line = line.strip()

        # Skip empty lines
        if not line:
            continue

        print(f"\nLine {i}: {line[:50]}{'...' if len(line) > 50 else ''}")

        # Check if line starts with a shard header (# followed by a number)
        is_shard_header = False
        clean_line = line

        # Handle both escaped and unescaped #
        if line.startswith("\#") and len(line) > 2 and line[2:].strip()[0].isdigit():
            is_shard_header = True
            clean_line = "#" + line[2:]  # Remove the backslash
        elif line.startswith("#") and len(line) > 1 and line[1:].strip()[0].isdigit():
            is_shard_header = True

        if is_shard_header:
            print(f"Found shard header: {clean_line}")
            # Save previous shard if exists
            if current_id is not None:
                shard_content = "\n".join(current_content).strip()
                print(f"Saving shard {current_id} with {len(shard_content)} chars")
                shards.append((current_id, shard_content))
                current_content = []

            # Extract shard ID and content
            parts = clean_line.split(" ", 1)
            try:
                current_id = int(parts[0][1:])  # Remove # and convert to int
                print(f"New shard ID: {current_id}")
                if len(parts) > 1:
                    current_content.append(parts[1])
                    print(f"  Initial content: {parts[1][:50]}...")
            except (ValueError, IndexError) as e:
                print(f"Error parsing shard ID from line: {line}")
                print(f"Error: {e}")
        else:
            # Add line to current shard
            if current_id is not None:  # Only add content if we're in a shard
                current_content.append(line)

    # Add the last shard if it exists
    if current_id is not None and current_content:
        shard_content = "\n".join(current_content).strip()
        print(f"Saving final shard {current_id} with {len(shard_content)} chars")
        shards.append((current_id, shard_content))

    print(f"\nFound {len(shards)} shards total")
    return shards


def update_database_shards(shards):
    """Update the shards in the database."""
    for shard_id, content in shards:
        print(f"Updating shard {shard_id}...")
        sb.table("pages").update({"content": content}).eq("id", shard_id).execute()


def main():
    # Path to the shards file
    shards_file = os.path.join("data", "an_author's_preface_shards.txt")
    print(f"Looking for file at: {os.path.abspath(shards_file)}")

    if not os.path.exists(shards_file):
        print(f"❌ Error: File not found at {shards_file}")
        print("Current directory:", os.getcwd())
        print("Directory contents:")
        for f in os.listdir("data"):
            print(f"- {f}")
        return

    # Parse the shards file
    print(f"Parsing {shards_file}...")
    shards = parse_shards_file(shards_file)
    print(f"Found {len(shards)} shards")

    # Update the database
    print("Updating database...")
    update_database_shards(shards)

    print("✅ Done! Shards have been updated in the database.")
    print("\nNext steps:")
    print(
        "1. Run the embedding script to update the embeddings for the full shard content:"
    )
    print("   python scripts/embed_seed.py")


if __name__ == "__main__":
    main()
