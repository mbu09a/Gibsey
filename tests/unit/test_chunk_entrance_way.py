import re

def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")

symbol_map: dict[str, str] = {}

def chunk_text(text, section_map):
    pattern = re.compile(r"###Page (\d+)###")
    matches = list(pattern.finditer(text))
    pages = []
    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start:end].strip()
        page_number = int(match.group(1))
        section_name = None
        chapter_name = None
        connected_character = None
        corpus_symbol = None
        for sec in section_map:
            if sec["start_page"] <= page_number <= sec["end_page"]:
                section_name = sec["section_name"]
                connected_character = sec.get("connected_character")
                if connected_character:
                    corpus_symbol = symbol_map.get(connected_character, slug(connected_character))
                for chap in sec.get("chapters", []):
                    if chap["start_page"] <= page_number <= chap["end_page"]:
                        chapter_name = chap["chapter_name"]
                        break
                break
        pages.append({
            "global_index": i + 1,
            "page_number": page_number,
            "section": section_name,
            "chapter": chapter_name,
            "connected_character": connected_character,
            "corpus_symbol": corpus_symbol,
            "text": content,
        })
    return pages


def test_chunking_and_metadata():
    sample_text = (
        "###Page 1###\n"
        "**Section One**\n"
        "First page text.\n"
        "###Page 2###\n"
        "Second page text.\n"
        "###Page 3###\n"
        "**Section Two**\n"
        "Third page text.\n"
    )

    section_map = [
        {
            "section": 1,
            "section_name": "Section One",
            "connected_character": "Fox",
            "start_page": 1,
            "end_page": 2,
            "chapters": [
                {"chapter": 1, "chapter_name": "Chapter One", "start_page": 2, "end_page": 2}
            ],
        },
        {
            "section": 2,
            "section_name": "Section Two",
            "connected_character": "Bear",
            "start_page": 3,
            "end_page": 3,
            "chapters": [],
        },
    ]

    pages = chunk_text(sample_text, section_map)

    assert [p["page_number"] for p in pages] == [1, 2, 3]
    assert [p["global_index"] for p in pages] == [1, 2, 3]

    assert pages[0]["section"] == "Section One"
    assert pages[0]["chapter"] is None
    assert pages[0]["corpus_symbol"] == "fox"
    assert pages[0]["connected_character"] == "Fox"

    assert pages[1]["section"] == "Section One"
    assert pages[1]["chapter"] == "Chapter One"
    assert pages[1]["corpus_symbol"] == "fox"
    assert pages[1]["connected_character"] == "Fox"

    assert pages[2]["section"] == "Section Two"
    assert pages[2]["chapter"] is None
    assert pages[2]["corpus_symbol"] == "bear"
    assert pages[2]["connected_character"] == "Bear"
