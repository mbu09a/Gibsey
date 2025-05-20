export interface RoleStyle {
  color: string;
  icon: string;
}

export const roleStyles: Record<string, RoleStyle> = {
  mythicGuardian: { color: '#FFD700', icon: '🛡' },
  guest: { color: '#888888', icon: '⋯' },
};

