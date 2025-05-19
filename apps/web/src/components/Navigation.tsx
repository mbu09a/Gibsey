import React from 'react';
import type { Section } from '../../../packages/types/entrance-way';
import { Link } from '@tanstack/react-router';

interface NavigationProps {
  sections: Section[];
}

export const Navigation: React.FC<NavigationProps> = ({ sections }) => (
  <nav className="p-4">
    <ul className="space-y-2">
      {sections.map((s) => (
        <li key={s.id}>
          <Link to={`/section/${s.id}`} className="text-terminal-green hover:underline">
            {s.sectionName}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);
