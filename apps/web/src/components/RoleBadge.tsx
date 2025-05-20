import React from 'react';
import { roleStyles } from '../utils/roleStyles';

export interface RoleBadgeProps {
  role: keyof typeof roleStyles;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const style = roleStyles[role] ?? roleStyles.guest;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 border rounded"
      style={{ borderColor: style.color }}
    >
      <span>{style.icon}</span>
      <span>{role}</span>
    </span>
  );
};

export default RoleBadge;

