export const symbolMap: Record<string, string> = {
  "The Author": "The_Author",
  "an author": "an_author",
  "Arieol Owlist": "arieol_owlist",
  "Cop-E-Right": "cop-e-right",
  "Glyph Marrow": "glyph_marrow",
  "Jack Parlance": "jack_parlance",
  "Jacklyn Variance": "jacklyn_variance",
  "London Fox": "london_fox",
  "Manny Valentinas": "manny_valentinas",
  "New Natalie Weissman": "new_natalie_weissman",
  "Old Natalie Weissman": "old_natalie_weissman",
  "Oren Progresso": "oren_progresso",
  "Phillip Bafflemint": "phillip_bafflemint",
  "Princhetta": "princhetta",
  "Shamrock Stillman": "shamrock_stillman",
  "Todd Fishbone": "todd_fishbone",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function characterToSymbol(name: string): string {
  if (name in symbolMap) return symbolMap[name];
  return slugify(name);
}