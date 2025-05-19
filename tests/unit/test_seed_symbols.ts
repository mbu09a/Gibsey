import { describe, it, expect } from 'vitest';
import { characterToSymbol } from '../../packages/utils/characterToSymbol';

describe('seeding symbol mapping', () => {
  const sectionMap = [
    { section: 1, section_name: 'Intro', connected_character: 'Cop-E-Right' },
  ];
  const pagesData = [
    { global_index: 1, page_number: 1, section: 'Intro', text: 'a' },
    { global_index: 2, page_number: 2, section: null as any, text: 'b' },
  ];

  function process() {
    const sections = sectionMap.map((s) => ({
      id: s.section,
      sectionName: s.section_name,
      corpusSymbol: characterToSymbol(s.connected_character),
    }));

    let currentSection = sectionMap[0].section_name;
    const pages = pagesData.map((p) => {
      if (p.section) currentSection = p.section;
      const sec = sectionMap.find((s) => s.section_name === currentSection)!;
      return {
        id: p.global_index,
        section: sec.section,
        sectionName: currentSection,
        corpusSymbol: characterToSymbol(sec.connected_character),
        pageNumber: p.page_number,
        globalIndex: p.global_index,
        text: p.text,
      };
    });

    return { sections, pages };
  }

  it('applies characterToSymbol for sections', () => {
    const { sections } = process();
    expect(sections[0].corpusSymbol).toBe('cop-e-right');
  });

  it('propagates symbol to pages', () => {
    const { pages } = process();
    expect(pages[0].corpusSymbol).toBe('cop-e-right');
    expect(pages[1].corpusSymbol).toBe('cop-e-right');
  });
});
