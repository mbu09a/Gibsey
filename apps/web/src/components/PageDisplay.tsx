import React from 'react';
import { trpc } from '../utils/trpc';
import ModalitySelector from './ModalitySelector';
import type { Page } from '../../../packages/types/entrance-way';

export interface PageDisplayProps {
  section?: number;
  index?: number;
  page?: Page | null;
  modality?: string;
  onModalityChange?: (value: string) => void;
  color?: string;
}

const PageDisplay: React.FC<PageDisplayProps> = ({
  section,
  index,
  page,
  modality = 'text',
  onModalityChange,
  color = '#00FF00',
}) => {
  // If page is not provided, fetch from API
  const { data, isLoading } = (!page && section && index)
    ? trpc.getPageById.useQuery(
        { section, index },
        { context: { modality } },
      )
    : { data: page, isLoading: false };
  const { data: metaList } = trpc.getSymbols.useQuery();

  if (isLoading) {
    return <div className="bg-black text-terminal-green p-4">Loading...</div>;
  }
  if (!data) {
    return <div className="bg-black text-terminal-green p-4">Page not found</div>;
  }

  // corpusSymbol values do not include the .svg extension
  const symbolSrc = `/the-corpus/symbols/${data.corpusSymbol}.svg`;
  const meta = metaList?.find(m => m.filename.replace('.svg', '') === data.corpusSymbol);

  return (
    <div
      className="bg-black text-terminal-green p-4 border"
      style={{ borderColor: color }}
    >
      {onModalityChange && (
        <div className="mb-2">
          <ModalitySelector
            modality={modality}
            onChange={onModalityChange}
            color={color}
          />
        </div>
      )}
      <h2 className="text-xl mb-2">
        Section {data.section} - {data.sectionName}
      </h2>
      <img
        src={symbolSrc}
        alt={data.sectionName}
        className="w-12 h-12 mb-2 border"
        style={{ borderColor: meta?.color ?? color }}
      />
      {meta?.orientation && (
        <div className="mb-2">Orientation: {meta.orientation}</div>
      )}
      <pre className="whitespace-pre-wrap font-mono">{data.text}</pre>
    </div>
  );
};

export default PageDisplay;