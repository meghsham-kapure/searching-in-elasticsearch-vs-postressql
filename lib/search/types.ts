export type Engine = "postgres" | "elasticsearch";

export interface Product {
  id: string | number;
  title: string;
  category: string;
  score?: number;
}

export interface SearchResult {
  timeMs: number;
  totalCount: number;
  results: Product[];
}

export interface StreamMessage {
  engine: Engine;
  timeMs: number;
  totalCount: number;
  results: Product[];
  error?: string;
}
