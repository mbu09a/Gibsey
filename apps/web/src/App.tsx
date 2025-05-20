import React, { useState, useEffect } from 'react';
import { trpc } from './trpc';
import Navigation from './components/Navigation';
import PageDisplay from './components/PageDisplay';
import SearchJump from './components/SearchJump';
import SymbolFilter from './components/SymbolFilter';
import ColorFilter from './components/ColorFilter';
import RoleBadge from './components/RoleBadge';
import { setModality } from './utils/modalityStore';

const App: React.FC = () => {
  const [section, setSection] = useState(1);
  const [index, setIndex] = useState(1);
  const [modality, setModalityState] = useState('text');
  const [dreamToast, setDreamToast] = useState(false);

  useEffect(() => {
    setModality(modality);
  }, [modality]);

  const { data: sections } = trpc.getSections.useQuery();
  const page = trpc.getPageById.useQuery(
    { section, index },
    { context: { modality } },
  );

  // Temporary user data until auth is implemented
  const user = { name: 'Guest', role: 'guest' as const };

  const currentColor =
    sections?.find((s) => s.id === section)?.color ?? '#00FF00';

  const handleModalityChange = (m: string) => {
    setModalityState(m);
  };

  const handleNavigate = (sec: number, idx: number) => {
    setSection(sec);
    setIndex(idx);
  };

  // Dream logging mutation (stub—replace with real Vault logging endpoint if available)
  const logDream = trpc.logDream?.useMutation?.({
    onSuccess: () => {
      setDreamToast(true);
      setTimeout(() => setDreamToast(false), 2000);
    },
  });

  return (
    <div className="space-y-4 border p-4" data-testid="app-root" style={{ borderColor: currentColor }}>
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl">Gibsey</h1>
        <div className="flex items-center gap-2">
          <span>{user.name}</span>
          <RoleBadge role={user.role} />
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
  );
};

export default App;
