export type UserRole = 'MythicGuardian' | 'Scribe' | 'Visitor';

export const permissionsMap: Record<UserRole, string[]> = {
  MythicGuardian: ['mergeEntries'],
  Scribe: [],
  Visitor: [],
};
