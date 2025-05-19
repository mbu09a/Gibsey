import re
import pytest

# Minimal chunk_text implementation used for tests
# Splits a text using page markers and assigns metadata from the section map

def chunk_text(text: str, section_map):
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
        # Determine section and chapter metadata based on the mapping
        for sec in section_map:
            if sec["start_page"] <= page_number <= sec["end_page"]:
                section_name = sec["section_name"]
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
            "text": content,
        })
    return pages


def test_chunk_text_basic():
    """Validate normal chunking with section and chapter mapping."""
    sample_text = (
        "###Page 1###\n"
        "First page text.\n"
        "###Page 2###\n"
        "Second page text.\n"
        "###Page 3###\n"
        "Third page text.\n"
    )

    section_map = [
        {
            "section": 1,
            "section_name": "One",
            "start_page": 1,
            "end_page": 2,
            "chapters": [
                {
                    "chapter": 1,
                    "chapter_name": "One-A",
                    "start_page": 2,
                    "end_page": 2,
                }
            ],
        },
        {
            "section": 2,
            "section_name": "Two",
            "start_page": 3,
            "end_page": 3,
            "chapters": [],
        },
    ]

    pages = chunk_text(sample_text, section_map)

    assert [p["page_number"] for p in pages] == [1, 2, 3]
    assert [p["global_index"] for p in pages] == [1, 2, 3]

    # Verify metadata assignment
    assert pages[0]["section"] == "One"
    assert pages[0]["chapter"] is None

    assert pages[1]["section"] == "One"
    assert pages[1]["chapter"] == "One-A"

    assert pages[2]["section"] == "Two"
    assert pages[2]["chapter"] is None



def test_chunk_text_edge_cases():
    """Handle pages without section mapping and empty page text."""
    sample_text = (
        "###Page 10###\n"
        "Unmapped page text.\n"
        "###Page 11###\n"
        "###Page 12###\n"
        "Final page.\n"
    )

    section_map = [
        {
            "section": 3,
            "section_name": "Three",
            "start_page": 12,
            "end_page": 12,
            "chapters": [],
        }
    ]

    pages = chunk_text(sample_text, section_map)

    assert len(pages) == 3
    assert [p["global_index"] for p in pages] == [1, 2, 3]

    # Page 10 has no mapping
    assert pages[0]["page_number"] == 10
    assert pages[0]["section"] is None
    assert pages[0]["chapter"] is None

    # Page 11 text is empty between markers
    assert pages[1]["page_number"] == 11
    assert pages[1]["text"] == ""

    # Page 12 mapped to section 3
    assert pages[2]["page_number"] == 12
    assert pages[2]["section"] == "Three"
    assert pages[2]["chapter"] is None
