import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { pages, sections } from '../src/schema';
import { readFile } from 'fs/promises';
import { characterToSymbol } from './symbol-map';

const db = drizzle(new Database('db.sqlite'));

async function seed() {
  // Clear existing data to keep the seed idempotent
  await db.delete(pages);
  await db.delete(sections);

  const sectionMap: Array<{ section: number; section_name: string; connected_character: string }> = JSON.parse(
    await readFile(new URL('./entrance-way-section-map.json', import.meta.url), 'utf8'),
  );

  // Helper to map characters to their canonical corpus symbol

  for (const s of sectionMap) {
    const corpusSymbol = characterToSymbol(s.connected_character);
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
    corpus_symbol?: string;
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
    const corpusSymbol = characterToSymbol(sectionRecord.connected_character);

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