import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent
source_file = BASE_DIR / 'the-entrance-way.txt'
output_file = BASE_DIR / 'the-entrance-way-pages.json'
section_map_file = BASE_DIR / 'entrance-way-section-map.json'

text = source_file.read_text(encoding='utf-8')
section_map = json.loads(section_map_file.read_text(encoding='utf-8'))

pattern = re.compile(r'###Page (\d+)###')

matches = list(pattern.finditer(text))

pages = []

def find_section_data(page_num: int) -> dict:
    """Return section/chapter info for a given page number."""
    for sec in section_map:
        if sec['start_page'] <= page_num <= sec['end_page']:
            data = {
                'section': sec['section'],
                'section_name': sec['section_name'],
                'connected_character': sec['connected_character'],
            }
            for chap in sec.get('chapters', []):
                if chap['start_page'] <= page_num <= chap['end_page']:
                    data['chapter'] = chap['chapter']
                    data['chapter_name'] = chap['chapter_name']
                    break
            return data
    return {}
for i, match in enumerate(matches):
    start = match.end()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
    content = text[start:end].strip()
    page_number = int(match.group(1))

    meta = find_section_data(page_number)

    page = {
        'global_index': i + 1,
        'page_number': page_number,
        'section': meta.get('section'),
        'section_name': meta.get('section_name'),
        'connected_character': meta.get('connected_character'),
        'text': content,
    }
    if 'chapter' in meta:
        page['chapter'] = meta['chapter']
        page['chapter_name'] = meta['chapter_name']

    pages.append(page)

with output_file.open('w', encoding='utf-8') as f:
    json.dump(pages, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(pages)} pages to {output_file}")
