import React, { useState, useEffect } from 'react';
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

const SymbolFilter: React.FC<{ color?: string }> = ({ color = '#00FF00' }) => {
  const { data: symbols } = trpc.getSymbols.useQuery();
  const [symbol, setSymbol] = useState('');
  const logMoveMutation = trpc.logQdpiMove.useMutation();
  const { data: pages } = trpc.getPagesBySymbol.useQuery(
    { symbol },
    { enabled: !!symbol }
  );

  useEffect(() => {
    if (symbol) {
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
        operationDetails: `Filtered by symbol: '${symbol}'`,
      });
    }
  }, [symbol, logMoveMutation]);

  return (
    <div className="bg-black text-terminal-green p-4 border" style={{ borderColor: color }}>
      <select
        value={symbol}
        onChange={e => setSymbol(e.target.value)}
        className="bg-black border text-terminal-green px-2 py-1 mb-2"
        style={{ borderColor: color }}
      >
        <option value="">Filter by symbol</option>
        {symbols?.map(s => {
          const value = s.filename.replace('.svg', '');
          return (
            <option
              key={value}
              value={value}
              style={{ color: s.color }}
            >
              {value}
              {s.orientation ? ` (${s.orientation})` : ''}
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
