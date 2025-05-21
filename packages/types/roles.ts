export enum Role {
  Human = 'Human',
  AICharacter = 'AICharacter',
  Guest = 'Guest',
  MythicGuardian = 'MythicGuardian',
  WholeSystem = 'WholeSystem',
  PartSystem = 'PartSystem',
}

// If you want to use string literal types as well:
export type RoleType =
  | 'Human'
  | 'AICharacter'
  | 'Guest'
  | 'MythicGuardian'
  | 'WholeSystem'
  | 'PartSystem';

export type RoleCapabilities = Record<RoleType, string[]>;

export const roleCapabilities: RoleCapabilities = {
  Human: ['read', 'react', 'comment', 'draft'],
  AICharacter: ['read', 'react', 'comment', 'draft', 'pull'],
  Guest: ['read', 'react'],
  MythicGuardian: ['read', 'react', 'comment', 'draft', 'pull', 'approve', 'moderate'],
  WholeSystem: ['read', 'react', 'comment', 'draft', 'pull', 'approve', 'orchestrate'],
  PartSystem: ['read', 'react', 'comment'],
};
