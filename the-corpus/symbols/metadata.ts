export interface SymbolMetadata {
  character: string;
  filename: string;
  color: string;
  orientation?: string;
  motif?: string;
}

export const symbolMetadata: SymbolMetadata[] = [
  { character: "The Author", filename: "The_Author.svg", color: "#e5b3d1", orientation: "inverted" },
  { character: "an author", filename: "an_author.svg", color: "#f3d9b1", orientation: "upright" },
  { character: "Arieol Owlist", filename: "arieol_owlist.svg", color: "#d1e5b3", orientation: "upright" },
  { character: "Cop-E-Right", filename: "cop-e-right.svg", color: "#b3d1e5", orientation: "right-facing" },
  { character: "Glyph Marrow", filename: "glyph_marrow.svg", color: "#cdb3e5", orientation: "upright" },
  { character: "Jack Parlance", filename: "jack_parlance.svg", color: "#e5c0b3", orientation: "left-facing" },
  { character: "Jacklyn Variance", filename: "jacklyn_variance.svg", color: "#b3e5d6", orientation: "upright" },
  { character: "London Fox", filename: "london_fox.svg", color: "#e5b3b3", orientation: "upright" },
  { character: "Manny Valentinas", filename: "manny_valentinas.svg", color: "#b3e5d1", orientation: "upright" },
  { character: "New Natalie Weissman", filename: "new_natalie_weissman.svg", color: "#e5d1b3", orientation: "upright" },
  { character: "Old Natalie Weissman", filename: "old_natalie_weissman.svg", color: "#d1b3e5", orientation: "upright" },
  { character: "Oren Progresso", filename: "oren_progresso.svg", color: "#b3e5c4", orientation: "upright" },
  { character: "Phillip Bafflemint", filename: "phillip_bafflemint.svg", color: "#b3c4e5", orientation: "upright" },
  { character: "Princhetta", filename: "princhetta.svg", color: "#e5b3c4", orientation: "upright" },
  { character: "Shamrock Stillman", filename: "shamrock_stillman.svg", color: "#c4e5b3", orientation: "upright" },
  { character: "Todd Fishbone", filename: "todd_fishbone.svg", color: "#b3e5b3", orientation: "upright" },
];
