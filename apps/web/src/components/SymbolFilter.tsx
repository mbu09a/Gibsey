import React, { useState } from 'react';
import { trpc } from '../utils/trpc';

const SymbolFilter: React.FC = () => {
  const { data: symbols } = trpc.getSymbols.useQuery();
  const [symbol, setSymbol] = useState('');
  const { data: pages } = trpc.getPagesBySymbol.useQuery(
    { symbol },
    { enabled: !!symbol }
  );

  return (
    <div className="bg-black text-terminal-green p-4 border border-terminal-green">
      <select
        value={symbol}
        onChange={e => setSymbol(e.target.value)}
        className="bg-black border border-terminal-green text-terminal-green px-2 py-1 mb-2"
      >
        <option value="">Filter by symbol</option>
        {symbols?.map(s => {
          const value = s.replace('.svg', '');
          return (
            <option key={value} value={value}>
              {value}
            </option>
          );
        })}
      </select>
      {pages && (
        <ul className="mt-2">
          {pages.map(p => (
            <li key={p.id}>Section {p.section} - Page {p.pageNumber}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SymbolFilter;
