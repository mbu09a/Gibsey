export interface RoleStyle {
  color: string;
  icon: string;
}

export const roleStyles: Record<string, RoleStyle> = {
  human: { color: '#00FF00', icon: '👤' },
  aiCharacter: { color: '#00FFFF', icon: '🤖' },
  mythicGuardian: { color: '#FFD700', icon: '🛡' },
  guest: { color: '#888888', icon: '⋯' },
  // Adding placeholder styles for other roles that might be used by RoleBadge
  // based on the Role enum, to prevent runtime errors if RoleBadge tries to access them.
  // These should ideally be defined according to actual design requirements.
  wholesystem: { color: '#FFFFFF', icon: '⚙️' }, // Example placeholder
  partsystem: { color: '#AAAAAA', icon: '🔩' }, // Example placeholder
};

