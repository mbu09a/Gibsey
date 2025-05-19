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

  const symbolMap: Record<string, string> = {
    'an author': 'an_author',
    'London Fox': 'london_fox',
    'Glyph Marrow': 'glyph_marrow',
    'Phillip Bafflemint': 'phillip_bafflemint',
    'Jacklyn Variance': 'jacklyn_variance',
    'Oren Progresso': 'oren_progresso',
    'Old Natalie Weissman': 'old_natalie_weissman',
    'Princhetta': 'princhetta',
    'Cop-E-Right': 'cop-e-right',
    'New Natalie Weissman': 'new_natalie_weissman',
    'Arieol Owlist': 'arieol_owlist',
    'Jack Parlance': 'jack_parlance',
    'Manny Valentinas': 'manny_valentinas',
    'Shamrock Stillman': 'shamrock_stillman',
    'Todd Fishbone': 'todd_fishbone',
    'The Author': 'The_Author',
  };

  for (const s of sectionMap) {
    await db.insert(sections).values({ id: s.section, sectionName: s.section_name });
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
    const corpusSymbol = symbolMap[sectionRecord.connected_character] ||
      sectionRecord.connected_character.toLowerCase().replace(/\s+/g, '_');

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

