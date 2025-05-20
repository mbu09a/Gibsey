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
  S2O = 0,
  O2S,
}

export enum Polarity {
  Internal = 0,
  External,
}

export enum Rotation {
  N = 0,
  E,
  S,
  W,
}

export enum Modality {
  Text = 0,
  Image,
  Audio,
  Video,
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

export function encodeGlyph(g: Glyph): number {
  const modality = g.modality ?? Modality.Text;
  return (
    (modality << 13) |
    (g.action << 10) |
    (g.context << 8) |
    (g.state << 6) |
    (g.role << 4) |
    (g.relation << 3) |
    (g.polarity << 2) |
    g.rotation
  );
}

export function decodeGlyph(code: number): Glyph {
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
  const modality = code & 0b11;
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
