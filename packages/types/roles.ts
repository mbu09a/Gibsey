export type Role = 'Guest' | 'Scribe' | 'Contributor' | 'Guardian';

export type RoleCapabilities = Record<Role, string[]>;

export const roleCapabilities: RoleCapabilities = {
  Guest: ['read', 'react'],
  Scribe: ['read', 'react', 'comment', 'draft'],
  Contributor: ['read', 'react', 'comment', 'draft', 'pull'],
  Guardian: ['read', 'react', 'comment', 'draft', 'pull', 'approve'],
};
