import React from 'react';
import { trpc } from '../utils/trpc';
import type { Page } from '../../../packages/types/entrance-way';

export interface PageDisplayProps {
  section?: number;
  index?: number;
  page?: Page | null;
}

const PageDisplay: React.FC<PageDisplayProps> = ({ section, index, page }) => {
  // If page is not provided, fetch from API
  const { data, isLoading } = (!page && section && index)
    ? trpc.getPageById.useQuery({ section, index })
    : { data: page, isLoading: false };

  if (isLoading) {
    return <div className="bg-black text-terminal-green p-4">Loading...</div>;
  }
  if (!data) {
    return <div className="bg-black text-terminal-green p-4">Page not found</div>;
  }

  const symbolSrc = `/the-corpus/symbols/${data.sectionName.replace(/\s+/g, '_')}.svg`;

  return (
    <div className="bg-black text-terminal-green p-4 border border-terminal-green">
      <h2 className="text-xl mb-2">{data.sectionName}</h2>
      <img src={symbolSrc} alt={data.sectionName} className="w-12 h-12 mb-2" />
      <pre className="whitespace-pre-wrap font-mono">{data.text}</pre>
    </div>
  );
};

export default PageDisplay;