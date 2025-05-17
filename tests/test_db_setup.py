"""Test database setup and basic operations."""

import psycopg2
import pytest

# Database connection parameters
DB_PARAMS = {
    "dbname": "gibsey",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": 5433,
}


def test_database_connection():
    """Test that we can connect to the database."""
    conn = psycopg2.connect(**DB_PARAMS)
    assert conn is not None
    conn.close()


def test_tables_exist():
    """Test that required tables exist."""
    with psycopg2.connect(**DB_PARAMS) as conn:
        with conn.cursor() as cur:
            # Check for pages table
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'pages'
                );
            """
            )
            assert cur.fetchone()[0] is True

            # Check for vault table
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'vault'
                );
            """
            )
            assert cur.fetchone()[0] is True


def test_pgvector_extension():
    """Test that pgvector extension is installed."""
    with psycopg2.connect(**DB_PARAMS) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT 1 FROM pg_extension 
                    WHERE extname = 'vector'
                );
            """
            )
            assert cur.fetchone()[0] is True


@pytest.mark.parametrize("table_name", ["pages", "vault"])
def test_table_columns(table_name):
    """Test that required columns exist in each table."""
    with psycopg2.connect(**DB_PARAMS) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = %s;
            """,
                (table_name,),
            )
            columns = [row[0] for row in cur.fetchall()]

            if table_name == "pages":
                expected_columns = {
                    "id",
                    "title",
                    "content",
                    "embedding",
                    "created_at",
                    "updated_at",
                }
            else:  # vault
                expected_columns = {
                    "id",
                    "user_id",
                    "page_id",
                    "question",
                    "answer",
                    "created_at",
                }

            assert expected_columns.issubset(columns)
