import React from 'react';
import type { Section } from '../../../../packages/types/entrance-way';

interface Props {
  sections: Section[];
  onSelect: (color: string) => void;
  color: string;
}

const ColorFilter: React.FC<Props> = ({ sections, onSelect, color }) => {
  const colors = Array.from(new Set(sections.map((s) => s.color)));

  return (
    <select
      value={color}
      onChange={(e) => onSelect(e.target.value)}
      className="bg-black border px-2 py-1 text-terminal-green"
      style={{ borderColor: color }}
      aria-label="color-select"
    >
      {colors.map((c) => (
        <option key={c} value={c} style={{ color: '#000', backgroundColor: c }}>
          {c}
        </option>
      ))}
    </select>
  );
};

export default ColorFilter;
