export enum Action {
  Read = 0,
  Index,
  Link,
  Prompt,
  React,
  Write,
  Save,
  Merge,
  Forget,
  Dream,
}

export enum Context {
  Page = 0,
  Prompt,
  Reaction,
  Generation,
}

export enum State {
  Public = 0,
  Private,
  Sacrifice,
  Gift,
}

export enum Role {
  Human = 0,
  AICharacter,
  Guest, // Temporary user with minimal persistence.
  MythicGuardian, // Narrative moderator, oversees merges and major protocol rituals.
  WholeSystem,
  PartSystem,
}

export enum Relation {
  S2O = 0, // Subject→Object
  O2S,     // Object→Subject
}

export enum Polarity {
  Internal = 0, // Princhetta
  External,     // Cop-E-Right
}

export enum Rotation {
  N = 0,
  E,
  S,
  W,
}

// Expand as needed for your six modalities!
export enum Modality {
  Text = 0,
  Audio,
  Video,
  AR,
  VR,
  Tactile,
}

export interface Glyph {
  action: Action;
  context: Context;
  state: State;
  role: Role;
  relation: Relation;
  polarity: Polarity;
  rotation: Rotation;
  modality?: Modality;
}

// Human-friendly string codec (base36)
export function encodeGlyphString(g: Glyph): string {
  const full: Glyph = {
    modality: Modality.Text,
    ...g,
  };
  const digits = [
    full.action,
    full.context,
    full.state,
    full.role,
    full.relation,
    full.polarity,
    full.rotation,
    full.modality,
  ];
  return digits.map((d) => d.toString(36)).join('');
}

export function decodeGlyphString(code: string): Glyph {
  const digits = code.split('').map((ch) => parseInt(ch, 36));
  const [action, context, state, role, relation, polarity, rotation, modality] = digits;
  // Default to Text if not present
  return {
    action: action as Action,
    context: context as Context,
    state: state as State,
    role: role as Role,
    relation: relation as Relation,
    polarity: polarity as Polarity,
    rotation: rotation as Rotation,
    modality: (modality as Modality) ?? Modality.Text,
  };
}

// Efficient numeric encoding (up to 92,160 unique values for 10x4x4x6x2x2x4x6)
export function encodeGlyphNumeric(g: Glyph): number {
  const m = g.modality ?? Modality.Text;
  return (
    (m << 15) |          // Modality: 3 bits (up to 8 values)
    (g.action << 11) |   // Action: 4 bits (up to 16 values)
    (g.context << 9) |   // Context: 2 bits (up to 4 values)
    (g.state << 7) |     // State: 2 bits (up to 4 values)
    (g.role << 4) |      // Role: 3 bits (up to 8 values)
    (g.relation << 3) |  // Relation: 1 bit (up to 2 values)
    (g.polarity << 2) |  // Polarity: 1 bit (up to 2 values)
    (g.rotation)         // Rotation: 2 bits (up to 4 values)
  );
}

export function decodeGlyphNumeric(code: number): Glyph {
  const rotation = code & 0b11;          // 2 bits
  code >>= 2;
  const polarity = code & 0b1;           // 1 bit
  code >>= 1;
  const relation = code & 0b1;           // 1 bit
  code >>= 1;
  const role = code & 0b111;             // 3 bits
  code >>= 3;
  const state = code & 0b11;             // 2 bits
  code >>= 2;
  const context = code & 0b11;           // 2 bits
  code >>= 2;
  const action = code & 0b1111;          // 4 bits
  code >>= 4;
  const modality = code & 0b111;         // 3 bits
  return {
    action: action as Action,
    context: context as Context,
    state: state as State,
    role: role as Role,
    relation: relation as Relation,
    polarity: polarity as Polarity,
    rotation: rotation as Rotation,
    modality: (modality as Modality) ?? Modality.Text,
  };
}
