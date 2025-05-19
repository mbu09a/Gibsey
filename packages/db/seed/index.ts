import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { pages, sections } from '../src/schema';
import { readFile } from 'fs/promises';

const db = drizzle(new Database('db.sqlite'));

async function seed() {
  // Clear existing data to keep the seed idempotent
  await db.delete(pages);
  await db.delete(sections);

  const sectionMap: Array<{ section: number; section_name: string; connected_character: string }> = JSON.parse(
    await readFile(new URL('./entrance-way-section-map.json', import.meta.url), 'utf8'),
  );

  // Canonical slug function
  const slug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

  // Optional: provide a symbolMap for overrides if you ever want to support special cases
  const symbolMap: Record<string, string> = {
    // Add only if you need a mapping that slug() can't cover
    // 'The Author': 'the_author',
    // ...
  };

  for (const s of sectionMap) {
    const corpusSymbol = symbolMap[s.connected_character] || slug(s.connected_character);
    await db.insert(sections).values({
      id: s.section,
      sectionName: s.section_name,
      corpusSymbol,
    });
  }

  const pagesData: Array<{
    global_index: number;
    page_number: number;
    section: string | null;
    text: string;
  }> = JSON.parse(
    await readFile(new URL('./the-entrance-way-pages.json', import.meta.url), 'utf8'),
  );

  let currentSection = sectionMap[0].section_name;
  for (const page of pagesData) {
    if (page.section) currentSection = page.section;
    const sectionRecord = sectionMap.find(
      (s) => s.section_name.toLowerCase() === currentSection.toLowerCase(),
    );
    if (!sectionRecord) continue;
    const corpusSymbol = symbolMap[sectionRecord.connected_character] || slug(sectionRecord.connected_character);

    await db.insert(pages).values({
      id: page.global_index,
      section: sectionRecord.section,
      sectionName: currentSection,
      corpusSymbol,
      pageNumber: page.page_number,
      globalIndex: page.global_index,
      text: page.text,
    });
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});