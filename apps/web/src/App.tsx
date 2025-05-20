import React, { useState } from 'react';
import { trpc } from './trpc';
import Navigation from './components/Navigation';
import PageDisplay from './components/PageDisplay';
import SearchJump from './components/SearchJump';
import SymbolFilter from './components/SymbolFilter';
import ColorFilter from './components/ColorFilter';
import RoleBadge from './components/RoleBadge';

const App: React.FC = () => {
  const [section, setSection] = useState(1);
  const [index, setIndex] = useState(1);
  const { data: sections } = trpc.getSections.useQuery();
  const page = trpc.getPageById.useQuery({ section, index });

  // Temporary user data until auth is implemented
  const user = { name: 'Guest', role: 'guest' as const };

  const currentColor =
    sections?.find((s) => s.id === section)?.color ?? '#00FF00';

  const handleNavigate = (sec: number, idx: number) => {
    setSection(sec);
    setIndex(idx);
  };

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
      </div>
    </div>
  );
};

export default App;
