import importlib
import logging
import sys
from types import SimpleNamespace

import pytest


class DummyResponse:
    def __init__(self, json_data):
        self._json_data = json_data

    def json(self):
        return self._json_data

    def raise_for_status(self):
        pass


def load_test_agent(monkeypatch, json_data):
    """Load test_agent with a stubbed requests module."""
    dummy_requests = SimpleNamespace(get=lambda *a, **k: DummyResponse(json_data))
    monkeypatch.setitem(sys.modules, "requests", dummy_requests)
    module = importlib.import_module("services.ai.test_agent")
    return importlib.reload(module)


def test_main_fetch_and_post(monkeypatch, caplog):
    agent = load_test_agent(
        monkeypatch,
        {"result": {"data": {"id": 1, "text": "Hello"}}},
    )
    caplog.set_level(logging.INFO)
    agent.main()
    assert "Page text: Hello" in caplog.text
    assert "Posting fake comment to page 1" in caplog.text


def test_missing_api_response(monkeypatch, caplog):
    agent = load_test_agent(monkeypatch, {})
    caplog.set_level(logging.INFO)
    agent.main()
    assert "Page not found" in caplog.text

