import React from 'react';
import { trpc } from '../utils/trpc';

export interface NavigationProps {
  section: number;
  index: number;
  onNavigate: (section: number, index: number) => void;
}

const sections = Array.from({ length: 16 }, (_, i) => i + 1);

const Navigation: React.FC<NavigationProps> = ({ section, index, onNavigate }) => {
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
        {sections.map(sec => (
          <option key={sec} value={sec}>Section {sec}</option>
        ))}
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
