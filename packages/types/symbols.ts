export interface SymbolMetadata {
  character: string;
  filename: string;
  color: string;
  orientation?: string;
  motif?: string;
}

export type GetSymbolsResult = SymbolMetadata[];
