import os
from unittest.mock import MagicMock, patch

import pytest

from app.config import Settings


# Set up test environment variables before importing anything that might use them
os.environ.update(
    {
        "SUPABASE_URL": "https://test.supabase.co",
        "SUPABASE_ANON_KEY": "test-key",
        "OPENAI_API_KEY": "test-openai-key",
    }
)


@pytest.fixture(autouse=True)
def mock_settings():
    """Mock settings for testing."""
    # Create a settings instance with test values
    settings = Settings()

    # Patch the get_settings function to return our test settings
    with patch("app.vector.get_settings") as mock_get_settings:
        mock_get_settings.return_value = settings
        yield settings


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    with patch("app.vector.Supabase") as mock_supabase:
        mock_client = MagicMock()
        mock_supabase.client.return_value = mock_client
        yield mock_client


@pytest.fixture
def mock_openai():
    """Mock OpenAI client."""
    with patch("app.vector.OpenAI") as mock_openai:
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        yield mock_client
