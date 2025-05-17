#!/usr/bin/env python3
"""Test FastAPI application directly."""
import sys

from fastapi.testclient import TestClient

# Add the backend directory to the path
sys.path.insert(0, "/Users/ghostradongus/Desktop/Gibsey/gibsey-repo/apps/backend")

# Import the FastAPI app
try:
    from app.main import app

    print("Successfully imported the FastAPI app!")
except ImportError as e:
    print(f"Error importing FastAPI app: {e}")
    sys.exit(1)

# Create a test client
client = TestClient(app)

# Test the /ask endpoint
response = client.post(
    "/ask", json={"question": "What is the main theme of the book?", "page_id": 1}
)

print("\nResponse:")
print("Status code:", response.status_code)
print("Response body:", response.json())
