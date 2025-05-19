import json
import subprocess
import sys
from pathlib import Path

def test_chunk_entrance_way(tmp_path):
    sample_text = (
        "###Page 1###\n"
        "**Section One**\n"
        "Page one text.\n\n"
        "###Page 2###\n"
        "**Section Two**\n"
        "Second page.\n\n"
        "###Page 3###\n"
        "Last bit."\n
    )
    (tmp_path / "the-entrance-way.txt").write_text(sample_text, encoding="utf-8")

    script_path = Path(__file__).resolve().parents[2] / "packages/db/seed/chunk_entrance_way.py"
    subprocess.run([sys.executable, str(script_path)], cwd=tmp_path, check=True)

    pages = json.loads((tmp_path / "the-entrance-way-pages.json").read_text(encoding="utf-8"))

    expected_sections = {1: "Section One", 2: "Section Two", 3: None}
    for idx, page in enumerate(pages, start=1):
        assert page["page_number"] == idx
        assert page["global_index"] == idx
        assert page["section"] == expected_sections[idx]

