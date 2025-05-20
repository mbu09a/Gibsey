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
  System,
  Subsystem,
}

export enum Relation {
  Subject = 0,
  Object,
}

export enum Polarity {
  Internal = 0,
  External,
}

export enum Orientation {
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

export interface GlyphAxes {
  action: Action;
  context: Context;
  state: State;
  role: Role;
  relation: Relation;
  polarity: Polarity;
  orientation: Orientation;
  modality: Modality;
}

export function encodeGlyph(
  axes: Omit<Partial<GlyphAxes>, 'modality'> & {
    action: Action;
    context: Context;
    state: State;
    role: Role;
    relation: Relation;
    polarity: Polarity;
    orientation: Orientation;
    modality?: Modality;
  }
): string {
  const full: GlyphAxes = {
    modality: Modality.Text,
    ...axes,
  } as GlyphAxes;
  const digits = [
    full.action,
    full.context,
    full.state,
    full.role,
    full.relation,
    full.polarity,
    full.orientation,
    full.modality,
  ];
  return digits.map((d) => d.toString(36)).join('');
}

export function decodeGlyph(code: string): GlyphAxes {
  const digits = code.split('').map((ch) => parseInt(ch, 36));
  const [action, context, state, role, relation, polarity, orientation, modality] = digits;
  const mod = digits.length === 7 ? Modality.Text : (modality as Modality);
  return {
    action: action as Action,
    context: context as Context,
    state: state as State,
    role: role as Role,
    relation: relation as Relation,
    polarity: polarity as Polarity,
    orientation: orientation as Orientation,
    modality: mod,
  };
}
