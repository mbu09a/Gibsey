from __future__ import annotations

import datetime as dt
import functools
import json
import pathlib
import time
from typing import Any, Callable

# current OpenAI pricing (USD per 1k tokens — adjust as needed)
PRICE = {
    "text-embedding-3-small": {"prompt": 0.00002, "completion": 0.0},
    "gpt-4o": {"prompt": 0.01, "completion": 0.03},
}

LOG_DIR = pathlib.Path("logs")
LOG_DIR.mkdir(exist_ok=True)


def instrument(model_name: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """Decorator that times the wrapped fn and logs token cost."""
    price = PRICE[model_name]

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            t0 = time.perf_counter()
            resp = func(*args, **kwargs)
            elapsed_ms = round((time.perf_counter() - t0) * 1000)

            usage = getattr(resp, "usage", None)  # OpenAI objects expose usage
            prompt_t = usage.prompt_tokens if usage else 0
            comp_t = usage.completion_tokens if usage else 0
            cost = round(
                (prompt_t * price["prompt"] + comp_t * price["completion"]) / 1000, 6
            )

            log_obj = {
                "ts": dt.datetime.utcnow().isoformat() + "Z",
                "model": model_name,
                "elapsed_ms": elapsed_ms,
                "prompt_tokens": prompt_t,
                "completion_tokens": comp_t,
                "cost_usd": cost,
            }
            print("[metrics]", json.dumps(log_obj))
            log_file = LOG_DIR / f"openai-{dt.date.today()}.jsonl"
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_obj) + "\n")
            # attach metrics dict so caller can forward to headers
            resp._metrics = log_obj  # type: ignore[attr-defined]
            return resp

        return wrapper

    return decorator
