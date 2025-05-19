export interface Section {
  id: number;
  sectionName: string;
}

export interface Page {
  id: number;
  section: number;
  sectionName: string;
  symbol: string;
  pageNumber: number;
  globalIndex: number;
  text: string;
}

export interface GetPageByIdParams {
  section: number;
  index: number;
}

export interface GetPagesBySectionParams {
  section: number;
}

export interface SearchPagesParams {
  query: string;
}

export interface GetPagesBySymbolParams {
  symbol: string;
}

export type GetPagesBySymbolResult = Page[];

export type GetPageByIdResult = Page | null;
export type GetPagesBySectionResult = Page[];
export type SearchPagesResult = Page[];

