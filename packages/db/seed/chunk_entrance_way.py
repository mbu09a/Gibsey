import json
import re
from pathlib import Path

source_file = Path('the-entrance-way.txt')
output_file = Path('the-entrance-way-pages.json')

text = source_file.read_text(encoding='utf-8')

pattern = re.compile(r'###Page (\d+)###')

matches = list(pattern.finditer(text))

pages = []
for i, match in enumerate(matches):
    start = match.end()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
    content = text[start:end].strip()
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    section = None
    if lines:
        heading_match = re.match(r'^\*{2}([^*]+)\*{2}$', lines[0])
        if heading_match:
            section = heading_match.group(1).strip()
    pages.append({
        'global_index': i + 1,
        'page_number': int(match.group(1)),
        'section': section,
        'text': content
    })

with output_file.open('w', encoding='utf-8') as f:
    json.dump(pages, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(pages)} pages to {output_file}")
