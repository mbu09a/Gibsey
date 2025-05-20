import React, { useState, useEffect } from 'react';
import { trpc } from './trpc';
import Navigation from './components/Navigation';
import PageDisplay from './components/PageDisplay';
import SearchJump from './components/SearchJump';
import SymbolFilter from './components/SymbolFilter';
import ColorFilter from './components/ColorFilter';
import { setModality } from './utils/modalityStore';

const App: React.FC = () => {
  const [section, setSection] = useState(1);
  const [index, setIndex] = useState(1);
  const [modality, setModalityState] = useState('text');

  useEffect(() => {
    setModality(modality);
  }, [modality]);
  const { data: sections } = trpc.getSections.useQuery();
  const page = trpc.getPageById.useQuery(
    { section, index },
    { context: { modality } },
  );

  const currentColor =
    sections?.find((s) => s.id === section)?.color ?? '#00FF00';

  const handleModalityChange = (m: string) => {
    setModalityState(m);
  };

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
      </div>
    </div>
  );
};

export default App;
