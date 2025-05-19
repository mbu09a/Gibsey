export const symbolMap: Record<string, string> = {
  "The Author": "The_Author.svg",
  "an author": "an_author.svg",
  "Arieol Owlist": "arieol_owlist.svg",
  "Cop-E-Right": "cop-e-right.svg",
  "Glyph Marrow": "glyph_marrow.svg",
  "Jack Parlance": "jack_parlance.svg",
  "Jacklyn Variance": "jacklyn_variance.svg",
  "London Fox": "london_fox.svg",
  "Manny Valentinas": "manny_valentinas.svg",
  "New Natalie Weissman": "new_natalie_weissman.svg",
  "Old Natalie Weissman": "old_natalie_weissman.svg",
  "Oren Progresso": "oren_progresso.svg",
  "Phillip Bafflemint": "phillip_bafflemint.svg",
  "Princhetta": "princhetta.svg",
  "Shamrock Stillman": "shamrock_stillman.svg",
  "Todd Fishbone": "todd_fishbone.svg",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function characterToSymbol(name: string): string {
  if (name in symbolMap) return symbolMap[name];
  return `${slugify(name)}.svg`;
}