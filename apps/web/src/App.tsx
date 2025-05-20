import React, { useState } from 'react';
import { trpc } from './trpc';
import Navigation from './components/Navigation';
import PageDisplay from './components/PageDisplay';
import SearchJump from './components/SearchJump';
import SymbolFilter from './components/SymbolFilter';
import ColorFilter from './components/ColorFilter';

const App: React.FC = () => {
  const [section, setSection] = useState(1);
  const [index, setIndex] = useState(1);
  const [dreamToast, setDreamToast] = useState(false);
  const { data: sections } = trpc.getSections.useQuery();
  const page = trpc.getPageById.useQuery({ section, index });
  const logDream = trpc.logDream.useMutation({
    onSuccess: () => {
      setDreamToast(true);
      setTimeout(() => setDreamToast(false), 2000);
    },
  });

  const currentColor =
    sections?.find((s) => s.id === section)?.color ?? '#00FF00';

  const handleNavigate = (sec: number, idx: number) => {
    setSection(sec);
    setIndex(idx);
  };

  return (
    <div className="space-y-4 border p-4" data-testid="app-root" style={{ borderColor: currentColor }}>
      <Navigation
        section={section}
        index={index}
        onNavigate={handleNavigate}
        sections={sections}
        color={currentColor}
      />
      <PageDisplay section={section} index={index} color={currentColor} />
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
