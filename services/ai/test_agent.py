"""
Fetch a single page from the running API and post a fake comment.

Run with `python test_agent.py` while the API server is running.
This script is used in tests to verify basic agent behavior.
"""

import json
import logging
from urllib.parse import quote
import requests

logging.basicConfig(level=logging.INFO)

API_BASE = "http://localhost:3000"


def fetch_page(section: int, index: int):
    """Fetch a page via the tRPC API."""
    url = f"{API_BASE}/trpc/getPageById?input={quote(json.dumps({'section': section, 'index': index}))}"
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
    data = resp.json()
    return data.get('result', {}).get('data')


def post_fake_comment(page_id: int, text: str):
    """Pretend to post a comment. This is a stub used for tests."""
    logging.info("Posting fake comment to page %s: %s", page_id, text)


def main():
    page = fetch_page(1, 1)
    if page:
        logging.info("Page text: %s", page.get('text'))
        post_fake_comment(page.get('id', 0), "Test comment from test_agent")
    else:
        logging.warning("Page not found")


if __name__ == "__main__":
    main()
