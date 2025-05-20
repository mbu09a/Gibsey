import React from 'react';

export interface ModalitySelectorProps {
  modality: string;
  onChange: (value: string) => void;
  color?: string;
}

const modalities = [
  { value: 'text', label: 'Text' },
  { value: 'audio', label: 'Audio' },
  { value: 'visual', label: 'Visual' },
];

const ModalitySelector: React.FC<ModalitySelectorProps> = ({ modality, onChange, color = '#00FF00' }) => (
  <select
    value={modality}
    onChange={e => onChange(e.target.value)}
    className="bg-black border text-terminal-green px-2 py-1"
    style={{ borderColor: color }}
  >
    {modalities.map(m => (
      <option key={m.value} value={m.value} style={{ color: '#000' }}>
        {m.label}
      </option>
    ))}
  </select>
);

export default ModalitySelector;
