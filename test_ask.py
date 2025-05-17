import json

import requests


def test_ask():
    url = "http://localhost:8000/ask"
    headers = {"Content-Type": "application/json"}
    data = {"page_id": 1, "question": "What is the secret of the glyph?"}

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        print("Response:")
        print(json.dumps(response.json(), indent=2))

        print("\nResponse Headers:")
        for key, value in response.headers.items():
            if key.startswith("X-"):
                print(f"{key}: {value}")

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        if hasattr(e, "response") and e.response is not None:
            print(f"Response: {e.response.text}")


if __name__ == "__main__":
    test_ask()
