import os
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

# Skip this test in CI since it requires OpenAI API key
pytestmark = pytest.mark.skipif(
    os.getenv("CI") == "true", reason="Skipping live API tests in CI"
)


@pytest.fixture
def mock_similar_pages():
    """Fixture to mock the similar_pages function."""

    async def mock_async_return(*args, **kwargs):
        return [
            {"page_id": 1, "content": "Sample content 1"},
            {"page_id": 2, "content": "Sample content 2"},
        ]

    with patch("app.main.similar_pages") as mock:
        # Mock return value for similar_pages
        mock.side_effect = mock_async_return
        yield mock


@pytest.fixture
def mock_openai():
    """Fixture to mock the OpenAI client."""
    with patch("app.main.get_openai_client") as mock_get_client:
        # Create a mock client
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        # Mock the chat completion response
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Test answer"
        mock_response.usage = MagicMock()
        mock_response.usage.prompt_tokens = 10
        mock_response.usage.completion_tokens = 20
        mock_response.usage.total_tokens = 30

        mock_client.chat.completions.create.return_value = mock_response

        yield mock_client


def test_ask_endpoint(mock_similar_pages, mock_openai):
    """Test the /ask endpoint with mocks."""
    # Test request
    test_data = {"page_id": 1, "question": "What is the meaning of life?", "k": 3}

    response = client.post("/ask", json=test_data)

    # Assertions
    assert response.status_code == 200, f"Response: {response.text}"
    data = response.json()
    assert "answer" in data
    assert data["answer"] == "Test answer"
    assert "metadata" in data
    assert data["metadata"]["model"] == "gpt-4o"
    assert data["metadata"]["tokens_used"] == 30

    # Check response headers
    assert "X-Latency-MS" in response.headers
    assert "X-Prompt-Tokens" in response.headers
    assert "X-Completion-Tokens" in response.headers
    assert "X-Cost-USD" in response.headers

    # Verify mocks were called as expected
    mock_similar_pages.assert_called_once_with("What is the meaning of life?", k=3)
    mock_openai.chat.completions.create.assert_called_once()

    # Check that the mock was called with expected arguments
    call_args = mock_similar_pages.call_args
    assert call_args[0][0] == "What is the meaning of life?"
    assert call_args[1]["k"] == 3


def test_ask_endpoint_error_handling():
    """Test error handling in the /ask endpoint."""
    # Test with invalid request (missing required field)
    response = client.post("/ask", json={"page_id": 1})  # missing question
    assert response.status_code == 422  # Validation error


@patch("app.vector.get_openai_client")
def test_ask_endpoint_openai_error(mock_get_client):
    """Test error handling when OpenAI API fails."""
    # Setup mock OpenAI client to raise an error
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("API error")

    test_data = {"page_id": 1, "question": "What is the meaning of life?", "k": 3}

    response = client.post("/ask", json=test_data)

    # Should return 500 status code
    assert response.status_code == 500
    data = response.json()
    assert "error" in data["metadata"]
