import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import ModalitySelector from './ModalitySelector';
import type { Page } from '../../../packages/types/entrance-way';
import { useRole } from '../contexts/RoleContext';
import { GlyphContext } from '../../../packages/utils/glyphCodec';
import {
  createWriteEventInput,
  createPromptEventInput,
  createLinkEventInput,
  createMergeEventInput,
  createDreamEventInput,
} from '../../../packages/qdpi'; // Adjust path if necessary, assuming it's in packages/qdpi/index.ts

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
  // savePageNote mutation is already imported by the original code.
  const saveNoteMutation = trpc.savePageNote.useMutation();
  const logQdpiMoveMutation = trpc.logQdpiMove.useMutation();
  const { currentRole } = useRole();

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

          // Log QDPI Write action
          const qdpiInput = createWriteEventInput(
            currentRole,
            GlyphContext.Reaction, // Assuming note is a reaction to page content
            {
              operationDetails: JSON.stringify({
                noteRelatedToPageId: currentPageId,
                newNoteId: data.newNoteId,
              }),
              userId: undefined, // Will be set by server from auth context
            }
          );
          logQdpiMoveMutation.mutate(qdpiInput, {
            onSuccess: () => console.log('QDPI Write action logged for savePageNote'),
            onError: (err) => console.error('Failed to log QDPI Write action', err),
          });
        },
        onError: (error) => {
          alert(`Error saving note: ${error.message}`);
        },
      }
    );
  };

  const handleGenericQdpiAction = (
    actionType: string,
    qdpiInputCreator: () => Parameters<typeof logQdpiMoveMutation.mutate>[0] 
  ) => {
    const qdpiInput = qdpiInputCreator();
    logQdpiMoveMutation.mutate(qdpiInput, {
      onSuccess: () => {
        console.log(`QDPI ${actionType} action logged successfully.`);
        alert(`${actionType} action logged (see console for details).`);
      },
      onError: (err) => {
        console.error(`Failed to log QDPI ${actionType} action`, err);
        alert(`Error logging ${actionType} action: ${err.message}`);
      },
    });
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

      {/* QDPI Action Buttons */}
      {currentPageId && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: color }}>
          <h3 className="text-lg mb-2">QDPI Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleGenericQdpiAction(
                'Prompt',
                () => createPromptEventInput(currentRole, GlyphContext.Page, {
                  operationDetails: JSON.stringify({ promptedOnPageId: currentPageId }),
                  userId: undefined,
                })
              )}
              className="border px-2 py-1" style={{ borderColor: color }}
            >
              Submit Prompt
            </button>
            <button
              onClick={() => handleGenericQdpiAction(
                'Link',
                () => createLinkEventInput(currentRole, GlyphContext.Page, {
                  operationDetails: JSON.stringify({ linkFromPageId: currentPageId, linkToPageId: currentPageId }),
                  userId: undefined,
                })
              )}
              className="border px-2 py-1" style={{ borderColor: color }}
            >
              Create Link
            </button>
            <button
              onClick={() => handleGenericQdpiAction(
                'Merge',
                () => createMergeEventInput(currentRole, GlyphContext.Page, {
                  operationDetails: JSON.stringify({ mergeOnPageId: currentPageId }),
                  userId: undefined,
                })
              )}
              className="border px-2 py-1" style={{ borderColor: color }}
            >
              Request Merge
            </button>
            <button
              onClick={() => handleGenericQdpiAction(
                'Dream',
                () => createDreamEventInput(currentRole, GlyphContext.Page, {
                  operationDetails: JSON.stringify({ dreamOnPageId: currentPageId }),
                  userId: undefined,
                })
              )}
              className="border px-2 py-1" style={{ borderColor: color }}
            >
              Initiate Dream
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageDisplay;