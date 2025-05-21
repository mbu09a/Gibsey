export interface QDPIMove {
  action: string;
  context?: string;
  target?: string;
  data?: unknown;
}

export interface VaultEntry {
  id: string;
  pageId?: string;
  links?: string[];
  contributions?: string[];
}

export function encode(move: QDPIMove): string {
  // Simple base64-encoded JSON representation
  return Buffer.from(JSON.stringify(move)).toString('base64');
}

export function decode(encoded: string): QDPIMove {
  return JSON.parse(Buffer.from(encoded, 'base64').toString());
}

export function linkPages(
  vault: Record<string, VaultEntry>,
  fromId: string,
  toId: string,
): void {
  const from = vault[fromId];
  if (!from) throw new Error('from entry not found');
  if (!from.links) from.links = [];
  from.links.push(toId);
}

export function mergeContributions(
  entry: VaultEntry,
  newContribs: string[],
): void {
  if (!entry.contributions) entry.contributions = [];
  entry.contributions.push(...newContribs);
}

// New QDPI event creation helpers

import {
  Action,
  Context as GlyphContext,
  State,
  Role,
  Relation,
  Polarity,
  Rotation,
  Modality,
} from '../utils/glyphCodec';

export type LogQdpiMoveInputType = {
  action: Action;
  context: GlyphContext;
  state: State;
  role: Role;
  relation: Relation;
  polarity: Polarity;
  rotation: Rotation;
  modality?: Modality;
  userId?: string;
  operationDetails?: string;
};

export function createReadEventInput(
  role: Role,
  context: GlyphContext,
  params?: { userId?: string; operationDetails?: string; modality?: Modality }
): LogQdpiMoveInputType {
  return {
    action: Action.Read,
    context,
    state: State.Public,
    role,
    relation: Relation.S2O,
    polarity: Polarity.External,
    rotation: Rotation.N,
    modality: params?.modality ?? Modality.Text,
    userId: params?.userId,
    operationDetails: params?.operationDetails,
  };
}

export function createPromptEventInput(
  role: Role,
  context: GlyphContext,
  params?: { userId?: string; operationDetails?: string; modality?: Modality }
): LogQdpiMoveInputType {
  return {
    action: Action.Prompt,
    context,
    state: State.Public,
    role,
    relation: Relation.S2O,
    polarity: Polarity.External,
    rotation: Rotation.N,
    modality: params?.modality ?? Modality.Text,
    userId: params?.userId,
    operationDetails: params?.operationDetails,
  };
}

export function createWriteEventInput(
  role: Role,
  context: GlyphContext,
  params?: {
    userId?: string;
    operationDetails?: string;
    modality?: Modality;
    state?: State;
    polarity?: Polarity;
  }
): LogQdpiMoveInputType {
  return {
    action: Action.Write,
    context,
    state: params?.state ?? State.Private,
    role,
    relation: Relation.S2O,
    polarity: params?.polarity ?? Polarity.Internal,
    rotation: Rotation.N,
    modality: params?.modality ?? Modality.Text,
    userId: params?.userId,
    operationDetails: params?.operationDetails,
  };
}

export function createLinkEventInput(
  role: Role,
  context: GlyphContext,
  params?: { userId?: string; operationDetails?: string; modality?: Modality }
): LogQdpiMoveInputType {
  return {
    action: Action.Link,
    context,
    state: State.Public,
    role,
    relation: Relation.S2O,
    polarity: Polarity.Internal,
    rotation: Rotation.N,
    modality: params?.modality ?? Modality.Text,
    userId: params?.userId,
    operationDetails: params?.operationDetails,
  };
}

export function createMergeEventInput(
  role: Role,
  context: GlyphContext,
  params?: { userId?: string; operationDetails?: string; modality?: Modality }
): LogQdpiMoveInputType {
  return {
    action: Action.Merge,
    context,
    state: State.Private,
    role,
    relation: Relation.S2O,
    polarity: Polarity.Internal,
    rotation: Rotation.N,
    modality: params?.modality ?? Modality.Text,
    userId: params?.userId,
    operationDetails: params?.operationDetails,
  };
}

export function createDreamEventInput(
  role: Role,
  context: GlyphContext,
  params?: { userId?: string; operationDetails?: string; modality?: Modality }
): LogQdpiMoveInputType {
  return {
    action: Action.Dream,
    context,
    state: State.Private,
    role,
    relation: Relation.O2S,
    polarity: Polarity.Internal,
    rotation: Rotation.S,
    modality: params?.modality ?? Modality.Text,
    userId: params?.userId,
    operationDetails: params?.operationDetails,
  };
}
