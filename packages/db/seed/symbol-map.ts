export const characterToSymbol = (name: string): string => {
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

  if (symbolMap[name]) {
    return symbolMap[name];
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
};
