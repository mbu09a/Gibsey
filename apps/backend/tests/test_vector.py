import os
from unittest.mock import MagicMock, patch

import pytest
from openai import OpenAI

# Import the module under test
from app.vector import _embed, similar_pages


# Set up environment variables
os.environ.update(
    {
        "SUPABASE_URL": "https://test.supabase.co",
        "SUPABASE_ANON_KEY": "test-key",
        "OPENAI_API_KEY": "test-openai-key",
    }
)


# Mock the OpenAI client for testing
class MockEmbeddingData:
    def __init__(self, embedding):
        self.embedding = embedding


class MockEmbeddingResponse:
    def __init__(self, embedding):
        self.data = [MockEmbeddingData(embedding)]


# Create a mock OpenAI client for testing
mock_client = MagicMock(spec=OpenAI)
mock_client.embeddings = MagicMock()
mock_client.embeddings.create.return_value = MockEmbeddingResponse([0.1, 0.2, 0.3])


def test_embed():
    """Test the _embed function with a mock OpenAI client."""
    # Test the _embed function with our mock client
    result = _embed("test query", client=mock_client)

    # Check the result
    assert result == [0.1, 0.2, 0.3]

    # Verify the OpenAI client was called correctly
    mock_client.embeddings.create.assert_called_once_with(
        model="text-embedding-3-small", input="test query"
    )


def test_similar_pages():
    """Test the similar_pages function with mocked dependencies."""
    # Create a fresh mock client for this test
    test_client = MagicMock(spec=OpenAI)
    test_client.embeddings = MagicMock()
    test_client.embeddings.create.return_value = MockEmbeddingResponse([0.1, 0.2, 0.3])

    # Mock the Supabase client
    with patch("app.vector.Supabase") as mock_supabase_class:
        mock_supabase = MagicMock()
        mock_supabase_class.client.return_value = mock_supabase

        # Mock the RPC call chain
        mock_rpc = MagicMock()
        mock_execute = MagicMock()
        mock_execute.data = [
            {"id": 1, "title": "Test", "content": "Test content", "score": 0.95},
            {"id": 2, "title": "Test 2", "content": "More content", "score": 0.9},
        ]
        mock_rpc.execute.return_value = mock_execute
        mock_supabase.rpc.return_value = mock_rpc

        # Test the function with our mock client
        results = similar_pages("test query", k=2, client=test_client)

        # Assertions
        assert len(results) == 2
        assert results[0]["title"] == "Test"
        assert results[1]["title"] == "Test 2"
        mock_supabase.rpc.assert_called_once_with(
            "match_pages", {"query_embedding": [0.1, 0.2, 0.3], "match_k": 2}
        )


def test_similar_pages_empty_result():
    """Test similar_pages with empty result from database."""
    # Create a fresh mock client for this test
    test_client = MagicMock(spec=OpenAI)
    test_client.embeddings = MagicMock()
    test_client.embeddings.create.return_value = MockEmbeddingResponse([0.1, 0.2, 0.3])

    # Mock the Supabase client
    with patch("app.vector.Supabase") as mock_supabase_class:
        mock_supabase = MagicMock()
        mock_supabase_class.client.return_value = mock_supabase

        # Mock empty result
        mock_rpc = MagicMock()
        mock_execute = MagicMock()
        mock_execute.data = []
        mock_rpc.execute.return_value = mock_execute
        mock_supabase.rpc.return_value = mock_rpc

        # Test the function with our mock client
        results = similar_pages("test query", client=test_client)

        # Assertions
        assert results == []
        mock_supabase.rpc.assert_called_once()


def test_embed_error_handling():
    """Test error handling in _embed function."""
    # Create a fresh mock client for this test
    test_client = MagicMock(spec=OpenAI)
    test_client.embeddings = MagicMock()
    test_client.embeddings.create.side_effect = Exception("API Error")

    # Test that the exception is raised
    with pytest.raises(Exception, match="API Error"):
        _embed("test query", client=test_client)
