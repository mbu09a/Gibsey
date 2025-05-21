import React, { useState, useEffect } from 'react';
import { trpc } from './trpc';
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
import Navigation from './components/Navigation';
import PageDisplay from './components/PageDisplay';
import SearchJump from './components/SearchJump';
import SymbolFilter from './components/SymbolFilter';
import ColorFilter from './components/ColorFilter';
import RoleBadge from './components/RoleBadge';
import { setModality } from './utils/modalityStore';
import { RoleProvider } from './contexts/RoleContext';

const App: React.FC = () => {
  const [section, setSection] = useState(1);
  const [index, setIndex] = useState(1);
  const [modality, setModalityState] = useState('text');
  const [dreamToast, setDreamToast] = useState(false);

  useEffect(() => {
    setModality(modality);
  }, [modality]);

  // QDPI logging mutation for every navigation event
  const logMoveMutation = trpc.logQdpiMove.useMutation();

  const { data: sections } = trpc.getSections.useQuery();
  const page = trpc.getPageById.useQuery(
    { section, index },
    { context: { modality } },
  );

  // Log every navigation (Read action) to QDPI
  useEffect(() => {
    if (page.data) {
      // Ensure modality enum maps from string safely
      const currentModalityString = modality.charAt(0).toUpperCase() + modality.slice(1);
      const glyphModality: Modality = (Modality as any)[currentModalityString] ?? Modality.Text;

      const glyphData: Glyph = {
        action: Action.Read,
        context: GlyphContext.Page,
        state: State.Public,
        role: Role.Human,
        relation: Relation.S2O,
        polarity: Polarity.External,
        rotation: Rotation.N,
        modality: glyphModality,
      };
      logMoveMutation.mutate({
        ...glyphData,
        operationDetails: `Navigated to section ${section}, page ${index}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.data, section, index, modality]);

  // Temporary user data until auth is implemented
  // This will be superseded by RoleContext for role, but name can remain.
  const user = { name: 'Guest' }; 

  const currentColor =
    sections?.find((s) => s.id === section)?.color ?? '#00FF00';

  const handleModalityChange = (m: string) => {
    setModalityState(m);
  };

  const handleNavigate = (sec: number, idx: number) => {
    setSection(sec);
    setIndex(idx);
  };

  // Dream logging mutation (Vault logging)
  const logDream = trpc.logDream?.useMutation?.({
    onSuccess: () => {
      setDreamToast(true);
      setTimeout(() => setDreamToast(false), 2000);
    },
  });

  return (
    <RoleProvider>
      <div className="space-y-4 border p-4" data-testid="app-root" style={{ borderColor: currentColor }}>
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl">Gibsey</h1>
          {/* RoleBadge will now be in Navigation and use RoleContext */}
          <div className="flex items-center gap-2">
             <span>{user.name}</span>
             {/* The RoleBadge here was using a local user.role, it will be removed as Navigation will handle it */}
          </div>
        </header>
        <Navigation
        {/* The RoleBadge here was using a local user.role, it will be removed as Navigation will handle it */}
        </div>
      </header>
      <Navigation
        section={section}
        index={index}
        onNavigate={handleNavigate}
        sections={sections}
        color={currentColor}
      />
      <PageDisplay
        section={section}
        index={index}
        modality={modality}
        onModalityChange={handleModalityChange}
        color={currentColor}
        currentPageId={page.data?.id}
      />
      <SearchJump onSelect={handleNavigate} color={currentColor} />
      <div className="flex gap-4">
        <SymbolFilter color={currentColor} />
        <ColorFilter
          sections={sections ?? []}
          onSelect={(c) => {
            const sec = sections?.find((s) => s.color === c);
            if (sec) handleNavigate(sec.id, 1);
          }}
          color={currentColor}
        />
        {logDream && (
          <button
            onClick={() =>
              logDream.mutate({
                action: 'Dream',
                context: 'ui',
                state: 'awake',
                role: 'reader',
                relation: 'self',
                polarity: 'neutral',
                rotation: 'N',
                content: page.data?.text ?? '',
                actorId: 'anon',
              })
            }
            className="border px-2 py-1"
            style={{ borderColor: currentColor }}
          >
            Dream
          </button>
        )}
      </div>
      {dreamToast && (
        <div className="text-terminal-green" data-testid="dream-toast">
          Dream captured in Vault
        </div>
      )}
    </div>
  </RoleProvider>
  );
};

export default App;

