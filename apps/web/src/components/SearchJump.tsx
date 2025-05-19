import React, { useState } from 'react';
import { trpc } from '../trpc';

export const SearchJump: React.FC = () => {
  const [query, setQuery] = useState('');
  const search = trpc.searchPages.useQuery(
    { query },
    { enabled: false }
  );

  const onSearch = () => search.refetch();

  return (
    <div className="p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-black text-terminal-green border border-terminal-green p-2"
        placeholder="Search or jump..."
      />
      <button
        onClick={onSearch}
        className="ml-2 px-2 py-1 bg-terminal-green text-black"
      >
        Go
      </button>
      <ul>
        {search.data?.map((page) => (
          <li key={page.id}>
            {page.sectionName} {page.pageNumber}
          </li>
        ))}
      </ul>
    </div>
  );
};
