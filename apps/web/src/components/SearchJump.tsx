import React, { useState } from 'react';
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

export interface SearchJumpProps {
  onSelect: (section: number, index: number) => void;
  color?: string;
}

const SearchJump: React.FC<SearchJumpProps> = ({ onSelect, color = '#00FF00' }) => {
  const [query, setQuery] = useState('');
  const [jumpSection, setJumpSection] = useState(1);
  const [jumpPage, setJumpPage] = useState(1);

  const search = trpc.searchPages.useQuery({ query }, { enabled: false });
  const logMoveMutation = trpc.logQdpiMove.useMutation();

  const handleSearch = () => {
    if (query.trim()) {
      const glyphData: Glyph = {
        action: Action.Prompt,
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
        operationDetails: `Performed search with query: '${query}'`,
      });
    }
    search.refetch();
  };
  const handleJump = () => onSelect(jumpSection, jumpPage);

  return (
    <div className="bg-black text-terminal-green p-4 border" style={{ borderColor: color }}>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="bg-black border text-terminal-green px-2 py-1 flex-grow"
          style={{ borderColor: color }}
          placeholder="Search"
        />
        <button onClick={handleSearch} className="border px-2 py-1" style={{ borderColor: color }}>Search</button>
      </div>
      {search.data && (
        <ul className="mb-2 max-h-40 overflow-y-auto">
          {search.data.map(page => (
            <li key={page.id}>
              <button
                className="underline"
                onClick={() => onSelect(page.section, page.pageNumber)}
              >
                Section {page.section} - Page {page.pageNumber}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={jumpSection}
          onChange={e => setJumpSection(Number(e.target.value))}
          className="bg-black border text-terminal-green px-2 py-1 w-20"
          style={{ borderColor: color }}
        />
        <input
          type="number"
          value={jumpPage}
          onChange={e => setJumpPage(Number(e.target.value))}
          className="bg-black border text-terminal-green px-2 py-1 w-20"
          style={{ borderColor: color }}
        />
        <button onClick={handleJump} className="border px-2 py-1" style={{ borderColor: color }}>Go</button>
      </div>
    </div>
  );
};

export default SearchJump;