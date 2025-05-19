import React from 'react';
import type { Page } from '../../../packages/types/entrance-way';

interface PageDisplayProps {
  page?: Page | null;
}

export const PageDisplay: React.FC<PageDisplayProps> = ({ page }) => {
  if (!page) {
    return <div className="text-gray-400">No page selected</div>;
  }
  return (
    <div className="whitespace-pre-wrap font-mono text-terminal-green">
      {page.text}
    </div>
  );
};
