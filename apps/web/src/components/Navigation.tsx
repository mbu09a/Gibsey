import React from 'react';
import { trpc } from '../utils/trpc';
import type { Section } from '../../../packages/types/entrance-way';
import { Link } from '@tanstack/react-router';
import { useRole } from '../contexts/RoleContext';
import { Role } from '../../../packages/utils/glyphCodec';
import RoleBadge from './RoleBadge'; // Assuming RoleBadge is in the same directory
import { roleStyles } from '../utils/roleStyles'; // For keyof typeof roleStyles

export interface NavigationProps {
  section: number;
  index: number;
  onNavigate: (section: number, index: number) => void;
  sections?: Section[];
  color?: string;
}

const Navigation: React.FC<NavigationProps> = ({ section, index, onNavigate, sections, color = '#00FF00' }) => {
  // Optionally fetch sections from API if not provided
  const { data: sectionList } = trpc.getSections
    ? trpc.getSections.useQuery(undefined, { enabled: !sections })
    : { data: sections };

  // Always fall back to prop or API data
  const sectionArray: Section[] = sections ?? sectionList ?? [];

  const { data: pages } = trpc.getPagesBySection.useQuery({ section });
  const pageNumbers = pages?.map(p => p.pageNumber) ?? [];
  const minIndex = Math.min(...pageNumbers, 1);
  const maxIndex = Math.max(...pageNumbers, 1);

  const prevDisabled = index <= minIndex;
  const nextDisabled = index >= maxIndex;

  const handlePrev = () => {
    if (!prevDisabled) onNavigate(section, index - 1);
  };

  const handleNext = () => {
    if (!nextDisabled) onNavigate(section, index + 1);
  };

  const { currentRole, setCurrentRole } = useRole();

  // Helper to get the string key for roleStyles from the Role enum value
  const getRoleStyleKey = (roleValue: Role): keyof typeof roleStyles => {
    const roleName = Role[roleValue]; // e.g., Role[0] -> "Human"
    return roleName?.toLowerCase() as keyof typeof roleStyles; // "human"
  };

  return (
    <div
      className="bg-black text-terminal-green p-4 flex items-center justify-between gap-4 border" // Added justify-between
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-4"> {/* Group for nav controls */}
        <button
          onClick={handlePrev}
          disabled={prevDisabled}
        className="border px-2 py-1 disabled:opacity-50"
        style={{ borderColor: color }}
      >
        Prev
      </button>
      <select
        value={section}
        onChange={e => onNavigate(Number(e.target.value), 1)}
        className="bg-black border text-terminal-green px-2 py-1"
        style={{ borderColor: color }}
      >
        {sectionArray.map(sec =>
          <option key={sec.id} value={sec.id}>
            {sec.sectionName}
          </option>
        )}
      </select>
      <button
        onClick={handleNext}
        disabled={nextDisabled}
        className="border px-2 py-1 disabled:opacity-50"
        style={{ borderColor: color }}
      >
          Next
        </button>
      </div>

      <div className="flex items-center gap-2"> {/* Group for role switcher */}
        <select
          value={currentRole}
          onChange={(e) => setCurrentRole(Number(e.target.value) as Role)}
          className="bg-black border text-terminal-green px-2 py-1"
          style={{ borderColor: color }}
          aria-label="Select Role"
        >
          <option value={Role.Human}>Human</option>
          <option value={Role.Guest}>Guest</option>
          <option value={Role.MythicGuardian}>Mythic Guardian</option>
          {/* Add other roles as needed, e.g., AICharacter if it's switchable */}
          <option value={Role.AICharacter}>AI Character</option>
        </select>
        <RoleBadge role={getRoleStyleKey(currentRole)} />
      </div>
    </div>
  );
};

export default Navigation;