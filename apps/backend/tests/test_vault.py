"""Tests for the vault endpoints."""

from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_list_vault_entries(mocker):
    """Test the /vault/list endpoint with pagination."""
    # Mock the Supabase response
    mock_data = [
        {
            "id": 1,
            "question": "Test question 1",
            "answer": "Test answer 1",
            "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        },
        {
            "id": 2,
            "question": "Test question 2",
            "answer": "Test answer 2",
            "created_at": datetime.utcnow().isoformat(),
        },
    ]

    # Mock the Supabase client
    mock_supabase = mocker.MagicMock()
    mock_supabase.table.return_value.select.return_value.order.return_value.range.return_value.execute.return_value.data = (
        mock_data
    )
    mocker.patch("app.main.Supabase.client", return_value=mock_supabase)

    # Make the request
    response = client.get("/vault/list?page=1&limit=2")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # The order should be as returned by the mock (no sorting in the test)
    assert data[0]["id"] == 1
    assert data[1]["id"] == 2

    # Verify the Supabase query was built correctly
    mock_supabase.table.assert_called_once_with("vault")
    mock_supabase.table.return_value.select.assert_called_once_with(
        "id, question, answer, created_at"
    )
    mock_supabase.table.return_value.select.return_value.order.assert_called_once_with(
        "created_at", desc=True
    )
    mock_supabase.table.return_value.select.return_value.order.return_value.range.assert_called_once_with(
        0, 1
    )  # 0 to (0+2-1)


def test_list_vault_entries_error_handling(mocker):
    """Test error handling in the /vault/list endpoint."""
    # Mock the Supabase client to raise an exception
    mock_supabase = mocker.MagicMock()
    mock_supabase.table.return_value.select.return_value.order.return_value.range.return_value.execute.side_effect = Exception(
        "Database error"
    )
    mocker.patch("app.main.Supabase.client", return_value=mock_supabase)

    # Make the request
    response = client.get("/vault/list")

    # Assertions
    assert response.status_code == 500
    assert "Error fetching vault entries" in response.text
