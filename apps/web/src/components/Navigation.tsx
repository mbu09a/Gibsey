import React from 'react';
import { trpc } from '../utils/trpc';
import type { Section } from '../../../packages/types/entrance-way';
import { Link } from '@tanstack/react-router';

export interface NavigationProps {
  section: number;
  index: number;
  onNavigate: (section: number, index: number) => void;
  sections?: Section[];
}

const Navigation: React.FC<NavigationProps> = ({ section, index, onNavigate, sections }) => {
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

  return (
    <div className="bg-black text-green-500 p-4 border border-green-500 flex items-center gap-4">
      <button
        onClick={handlePrev}
        disabled={prevDisabled}
        className="border border-green-500 px-2 py-1 disabled:opacity-50"
      >
        Prev
      </button>
      <select
        value={section}
        onChange={e => onNavigate(Number(e.target.value), 1)}
        className="bg-black border border-green-500 text-green-500 px-2 py-1"
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
        className="border border-green-500 px-2 py-1 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Navigation;