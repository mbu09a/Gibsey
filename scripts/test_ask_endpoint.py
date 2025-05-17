#!/usr/bin/env python3
"""
Test the /ask endpoint with a question.
Usage: python test_ask_endpoint.py "Your question here"
"""
import sys

import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def test_ask(question, base_url="http://localhost:8000"):
    """Test the /ask endpoint with the given question."""
    url = f"{base_url}/ask"
    headers = {"Content-Type": "application/json"}
    data = {"question": question, "page_id": 1}

    print(f"Sending request to: {url}")
    print(f"Request data: {data}")

    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")

        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        if hasattr(e, "response") and e.response is not None:
            print(f"Response content: {e.response.text}")
        return None


if __name__ == "__main__":
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        question = "What is this book about?"

    print(f"Asking: '{question}'\n")

    result = test_ask(question)

    if result:
        print("Answer:")
        print("-------")
        print(result["answer"])

        if result.get("metadata"):
            meta = result["metadata"]
            print("\nMetadata:")
            print("----------")
            print(f"Response time: {meta['response_time_ms']} ms")

            if meta.get("context_pages"):
                print("\nContext Pages:")
                for page in meta["context_pages"]:
                    print(
                        f"- {page['title']} (ID: {page['id']}, Score: {page['score']:.4f})"
                    )
    else:
        print("Failed to get a response from the server.")
