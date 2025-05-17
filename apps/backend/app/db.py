import os
from typing import Optional

from fastapi import HTTPException
from supabase import Client, create_client

from .config import get_settings


class Supabase:
    _client: Optional[Client] = None

    @classmethod
    def client(cls) -> Client:
        if cls._client is None:
            try:
                s = get_settings()
                url = os.environ.get("SUPABASE_URL") or s.supabase_url
                key = os.environ.get("SUPABASE_ANON_KEY") or s.supabase_key

                if not url or not key:
                    raise ValueError("Supabase URL and key must be provided")

                cls._client = create_client(url, key)
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Database connection error: {str(e)}"
                )
        return cls._client
