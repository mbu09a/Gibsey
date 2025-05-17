"""Pytest configuration and fixtures."""

import subprocess

# Add the project root to the Python path
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Set up the test database before running tests."""
    # Ensure the database is running
    subprocess.run(["docker", "compose", "up", "-d", "db"], check=True)

    # Wait for the database to be ready
    subprocess.run(
        ["docker", "compose", "exec", "-T", "db", "pg_isready", "-U", "postgres"],
        check=True,
        timeout=30,
    )

    # Run the reset script before tests
    reset_script = Path(__file__).parent.parent / "scripts" / "reset_db.sh"
    if reset_script.exists():
        subprocess.run([str(reset_script)], check=True)


@pytest.fixture(autouse=True)
def reset_database():
    """Reset the database before each test."""
    # The setup_database fixture will run first and handle the initial setup
    # This fixture is a placeholder in case we need per-test reset logic
    pass
