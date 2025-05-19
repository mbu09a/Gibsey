import React from 'react';
import { trpc } from '../utils/trpc';

export interface PageDisplayProps {
  section: number;
  index: number;
}

const PageDisplay: React.FC<PageDisplayProps> = ({ section, index }) => {
  const { data, isLoading } = trpc.getPageById.useQuery({ section, index });

  if (isLoading) {
    return <div className="bg-black text-green-500 p-4">Loading...</div>;
  }

  if (!data) {
    return <div className="bg-black text-green-500 p-4">Page not found</div>;
  }

  const symbolSrc = `/the-corpus/symbols/${data.sectionName.replace(/\s+/g, '_')}.svg`;

  return (
    <div className="bg-black text-green-500 p-4 border border-green-500">
      <h2 className="text-xl mb-2">{data.sectionName}</h2>
      <img src={symbolSrc} alt={data.sectionName} className="w-12 h-12 mb-2" />
      <pre className="whitespace-pre-wrap font-mono">{data.text}</pre>
    </div>
  );
};

export default PageDisplay;
