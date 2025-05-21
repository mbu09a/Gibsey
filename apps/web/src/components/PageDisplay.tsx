import React, { useState } from 'react';
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
  currentPageId?: number;
}

const PageDisplay: React.FC<PageDisplayProps> = ({
  section,
  index,
  page,
  modality = 'text',
  onModalityChange,
  color = '#00FF00',
  currentPageId,
}) => {
  const [noteText, setNoteText] = useState('');
  const saveNoteMutation = trpc.savePageNote.useMutation();

  // If page is not provided, fetch from API
  const { data, isLoading } = (!page && section && index)
    ? trpc.getPageById.useQuery(
        { section, index },
        { context: { modality } },
      )
    : { data: page, isLoading: false };
  const { data: metaList } = trpc.getSymbols.useQuery();

  const handleSaveNote = () => {
    if (!currentPageId) {
      alert('Error: Page ID is not available to save the note.');
      return;
    }
    if (noteText.trim() === '') {
      alert('Note cannot be empty.');
      return;
    }
    saveNoteMutation.mutate(
      {
        pageId: currentPageId,
        noteText: noteText,
        // userId could be added here if available
      },
      {
        onSuccess: (data) => {
          alert(`Note saved successfully! Note ID: ${data.newNoteId}`);
          setNoteText(''); // Clear the textarea
        },
        onError: (error) => {
          alert(`Error saving note: ${error.message}`);
        },
      }
    );
  };

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

      {/* Notes Section */}
      {currentPageId && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: color }}>
          <h3 className="text-lg mb-2">Page Notes</h3>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your note here..."
            className="w-full bg-black border text-terminal-green p-2 mb-2"
            style={{ borderColor: color }}
            rows={4}
          />
          <button
            onClick={handleSaveNote}
            disabled={saveNoteMutation.isPending}
            className="border px-2 py-1"
            style={{ borderColor: color }}
          >
            {saveNoteMutation.isPending ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      )}

      {/* Placeholder for Action.Link and Action.Merge */}
      {currentPageId && ( // Only show if there's a page context
        <div className="mt-4 pt-4 border-t" style={{ borderColor: color }}>
          <h3 className="text-lg mb-2">Future Actions</h3>
          <div className="flex space-x-2">
            {/* Action.Link: Connects pages or timelines. */}
            <button
              onClick={() => console.log('TODO: Implement Link Action UI and log QDPI move for Action.Link')}
              className="border px-2 py-1"
              style={{ borderColor: color }}
            >
              Link Page
            </button>
            {/* Action.Merge: Combines Vault artifacts, folding multiple drafts or branches. */}
            <button
              onClick={() => console.log('TODO: Implement Merge Action UI and log QDPI move for Action.Merge')}
              className="border px-2 py-1"
              style={{ borderColor: color }}
            >
              Merge Artifacts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageDisplay;