#!/usr/bin/env python3
"""Verify that the database is properly initialized."""
import os
import sys

import psycopg2
from dotenv import load_dotenv
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def connect_db():
    """Connect to the database using environment variables."""
    load_dotenv()

    conn_params = {
        "dbname": os.getenv("POSTGRES_DB", "gibsey"),
        "user": os.getenv("POSTGRES_USER", "postgres"),
        "password": os.getenv("POSTGRES_PASSWORD", "postgres"),
        "host": os.getenv("POSTGRES_HOST", "localhost"),
        "port": os.getenv("POSTGRES_PORT", "5432"),
    }

    try:
        conn = psycopg2.connect(**conn_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)


def check_tables(conn):
    """Check if required tables exist and have the correct schema."""
    required_tables = {
        "pages": {"id", "title", "content", "embedding", "created_at", "updated_at"},
        "vault": {"id", "user_id", "page_id", "question", "answer", "created_at"},
    }

    with conn.cursor() as cur:
        # Check if tables exist
        for table in required_tables:
            cur.execute(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s);",
                (table,),
            )
            exists = cur.fetchone()[0]
            if not exists:
                print(f"❌ Table '{table}' does not exist")
                continue

            # Check columns
            cur.execute(
                """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = %s;
                """,
                (table,),
            )
            columns = {row[0] for row in cur.fetchall()}
            missing_columns = required_tables[table] - columns

            if missing_columns:
                print(
                    f"❌ Table '{table}' is missing columns: {', '.join(missing_columns)}"
                )
            else:
                print(f"✅ Table '{table}' has all required columns")


def check_extensions(conn):
    """Check if required extensions are installed."""
    required_extensions = {"vector"}

    with conn.cursor() as cur:
        cur.execute("SELECT extname FROM pg_extension;")
        installed_extensions = {row[0] for row in cur.fetchall()}

        for ext in required_extensions:
            if ext in installed_extensions:
                print(f"✅ Extension '{ext}' is installed")
            else:
                print(f"❌ Extension '{ext}' is not installed")


def main():
    """Main function to verify database setup."""
    print("🔍 Verifying database setup...\n")

    # Connect to the database
    print("Connecting to database...")
    conn = connect_db()
    print("✅ Connected to database\n")

    # Check extensions
    print("Checking extensions...")
    check_extensions(conn)
    print()

    # Check tables
    print("Checking tables...")
    check_tables(conn)
    print()

    conn.close()
    print("✅ Database verification complete")


if __name__ == "__main__":
    main()
