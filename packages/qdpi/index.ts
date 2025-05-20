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
