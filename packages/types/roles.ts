export enum Role {
  Human = 'Human',
  AI = 'AI',
  Guest = 'Guest',
  Scribe = 'Scribe',
  Contributor = 'Contributor',
  Guardian = 'Guardian',
  MythicGuardian = 'MythicGuardian',
  WholeSystem = 'WholeSystem',
  PartSystem = 'PartSystem',
}

// If you want to use string literal types as well:
export type RoleType =
  | 'Human'
  | 'AI'
  | 'Guest'
  | 'Scribe'
  | 'Contributor'
  | 'Guardian'
  | 'MythicGuardian'
  | 'WholeSystem'
  | 'PartSystem';

export type RoleCapabilities = Record<RoleType, string[]>;

export const roleCapabilities: RoleCapabilities = {
  Human: ['read', 'react', 'comment', 'draft'],
  AI: ['read', 'react', 'comment', 'draft', 'pull'],
  Guest: ['read', 'react'],
  Scribe: ['read', 'react', 'comment', 'draft'],
  Contributor: ['read', 'react', 'comment', 'draft', 'pull'],
  Guardian: ['read', 'react', 'comment', 'draft', 'pull', 'approve'],
  MythicGuardian: ['read', 'react', 'comment', 'draft', 'pull', 'approve', 'moderate'],
  WholeSystem: ['read', 'react', 'comment', 'draft', 'pull', 'approve', 'orchestrate'],
  PartSystem: ['read', 'react', 'comment'],
};
