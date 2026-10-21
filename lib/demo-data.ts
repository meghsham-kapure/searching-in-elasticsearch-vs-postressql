export type SearchResult = {
  id: string;
  title: string;
  description: string;
  source: "postgres" | "elasticsearch";
  score?: number;
  metadata: {
    table?: string;   // postgres
    index?: string;   // elasticsearch
    highlights?: string[];
  };
  stream: {
    startedAt: number;   // epoch ms
    finishedAt: number;  // epoch ms
  };
};

function fakeStream(baseDelay: number, duration: number) {
  const now = Date.now();
  return {
    startedAt: now - baseDelay - duration,
    finishedAt: now - baseDelay,
  };
}

export const DEMO_POSTGRES_RESULTS: SearchResult[] = [
  {
    id: "pg-1",
    title: "Introduction to Full-Text Search in PostgreSQL",
    description:
      "PostgreSQL supports full-text search natively via tsvector and tsquery. You can index large text columns and query them with ranking functions like ts_rank.",
    source: "postgres",
    metadata: { table: "articles" },
    stream: fakeStream(120, 310),
  },
  {
    id: "pg-2",
    title: "GIN vs GiST Indexes for Text Search",
    description:
      "GIN indexes are generally faster for static data while GiST indexes allow lossy storage and are better for frequently updated columns.",
    source: "postgres",
    metadata: { table: "docs" },
    stream: fakeStream(80, 290),
  },
  {
    id: "pg-3",
    title: "Using pg_trgm for Similarity Search",
    description:
      "The pg_trgm extension enables trigram-based similarity matching, making it possible to find near-matches and typo-tolerant queries.",
    source: "postgres",
    metadata: { table: "knowledge_base" },
    stream: fakeStream(60, 270),
  },
];

export const DEMO_ELASTIC_RESULTS: SearchResult[] = [
  {
    id: "es-1",
    title: "Elasticsearch Query DSL Overview",
    description:
      "The Elasticsearch Query DSL provides a rich JSON-based language for building queries: match, term, bool, nested, and more — all composable.",
    source: "elasticsearch",
    score: 0.98,
    metadata: {
      index: "search-docs",
      highlights: ["Query DSL", "rich JSON-based", "bool"],
    },
    stream: fakeStream(40, 180),
  },
  {
    id: "es-2",
    title: "Relevance Tuning with BM25",
    description:
      "Elasticsearch uses BM25 by default for relevance scoring. You can tune k1 and b parameters per-field to control term frequency saturation and field-length normalization.",
    source: "elasticsearch",
    score: 0.91,
    metadata: {
      index: "search-docs",
      highlights: ["BM25", "relevance scoring", "k1 and b parameters"],
    },
    stream: fakeStream(20, 160),
  },
  {
    id: "es-3",
    title: "Vector Search with HNSW in Elasticsearch",
    description:
      "Elasticsearch 8+ supports dense vector fields and ANN search via HNSW, enabling semantic similarity search alongside traditional keyword search.",
    source: "elasticsearch",
    score: 0.87,
    metadata: {
      index: "ml-index",
      highlights: ["dense vector", "HNSW", "semantic similarity"],
    },
    stream: fakeStream(10, 145),
  },
];
