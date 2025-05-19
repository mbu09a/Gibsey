import React, { useState } from 'react';
import { trpc } from '../utils/trpc';

export interface SearchJumpProps {
  onSelect: (section: number, index: number) => void;
}

const SearchJump: React.FC<SearchJumpProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [jumpSection, setJumpSection] = useState(1);
  const [jumpPage, setJumpPage] = useState(1);

  const search = trpc.searchPages.useQuery({ query }, { enabled: false });

  const handleSearch = () => search.refetch();
  const handleJump = () => onSelect(jumpSection, jumpPage);

  return (
    <div className="bg-black text-terminal-green p-4 border border-terminal-green">
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="bg-black border border-terminal-green text-terminal-green px-2 py-1 flex-grow"
          placeholder="Search"
        />
        <button onClick={handleSearch} className="border border-terminal-green px-2 py-1">Search</button>
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
          className="bg-black border border-terminal-green text-terminal-green px-2 py-1 w-20"
        />
        <input
          type="number"
          value={jumpPage}
          onChange={e => setJumpPage(Number(e.target.value))}
          className="bg-black border border-terminal-green text-terminal-green px-2 py-1 w-20"
        />
        <button onClick={handleJump} className="border border-terminal-green px-2 py-1">Go</button>
      </div>
    </div>
  );
};

export default SearchJump;