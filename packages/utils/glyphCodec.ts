export enum Action {
  Read = 0,
  Index,
  Prompt,
  React,
  Write,
  Save,
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
  AI,
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

// Efficient numeric encoding (up to 24,576 unique values for 8x4x4x4x2x2x4x6)
export function encodeGlyphNumeric(g: Glyph): number {
  const m = g.modality ?? Modality.Text;
  return (
    (m << 13) |                 // 3 bits for modality (up to 8 values)
    (g.action << 10) |          // 3 bits (up to 8)
    (g.context << 8) |          // 2 bits (up to 4)
    (g.state << 6) |            // 2 bits (up to 4)
    (g.role << 4) |             // 2 bits (up to 4)
    (g.relation << 3) |         // 1 bit (2)
    (g.polarity << 2) |         // 1 bit (2)
    (g.rotation)                // 2 bits (up to 4)
  );
}

export function decodeGlyphNumeric(code: number): Glyph {
  const rotation = code & 0b11;
  code >>= 2;
  const polarity = code & 0b1;
  code >>= 1;
  const relation = code & 0b1;
  code >>= 1;
  const role = code & 0b11;
  code >>= 2;
  const state = code & 0b11;
  code >>= 2;
  const context = code & 0b11;
  code >>= 2;
  const action = code & 0b111;
  code >>= 3;
  const modality = code & 0b111; // 3 bits for up to 8 modalities
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
