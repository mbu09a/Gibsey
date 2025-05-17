#!/usr/bin/env python3
"""
Test the vector search functionality manually.
Usage: python test_vector_search.py "Your query text here"
"""
import json
import sys
from pathlib import Path

# Add backend to path before importing app modules
sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "backend"))

from app.vector import similar_pages
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        query = "Who is the mysterious Author?"
    else:
        query = sys.argv[1]

    print(f"Searching for pages similar to: '{query}'")

    try:
        results = similar_pages(query, k=3)
        print(json.dumps(results, indent=2))

        if results:
            print("\nTop result summary:")
            print(f"Score: {results[0]['score']:.4f}")
            print(f"Title: {results[0]['title']}")
            print(f"Content preview: {results[0]['content'][:100]}...")
    except Exception as e:
        print(f"Error: {str(e)}")
