import React from 'react';
import type { Section } from '../../../../packages/types/entrance-way';
import { trpc } from '../utils/trpc';
import {
  Action,
  Context as GlyphContext,
  State,
  Role,
  Relation,
  Polarity,
  Rotation,
  Modality,
  Glyph,
} from '../../../packages/utils/glyphCodec';

interface Props {
  sections: Section[];
  onSelect: (color: string) => void;
  color: string;
}

const ColorFilter: React.FC<Props> = ({ sections, onSelect, color }) => {
  const colors = Array.from(new Set(sections.map((s) => s.color)));
  const logMoveMutation = trpc.logQdpiMove.useMutation();

  const handleSelect = (selectedColor: string) => {
    const glyphData: Glyph = {
      action: Action.Index,
      context: GlyphContext.Prompt,
      state: State.Public,
      role: Role.Human,
      relation: Relation.S2O,
      polarity: Polarity.External,
      rotation: Rotation.N,
      modality: Modality.Text,
    };
    logMoveMutation.mutate({
      ...glyphData,
      operationDetails: `Filtered by color: '${selectedColor}'`,
    });
    onSelect(selectedColor);
  };

  return (
    <select
      value={color}
      onChange={(e) => handleSelect(e.target.value)}
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
