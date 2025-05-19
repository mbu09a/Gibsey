export const symbolOverrides: Record<string, string> = {
  'Cop-E-Right': 'cop-e-right'
};

export function characterToSymbol(name: string): string {
  const override = symbolOverrides[name];
  if (override) return override;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
