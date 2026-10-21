export const TABLE_NAME = "products";
export const INDEX_NAME = "products";

export const INDEX_MAPPING = {
  properties: {
    title: { type: "text" as const },
    category: { type: "keyword" as const },
  },
};

export const CSV_PATH = "data/products.csv";

// Batch sizes for data population
export const PG_BATCH_SIZE = 1000;
export const ES_BATCH_SIZE = 5000;

// Progress logging
export const PROGRESS_INTERVAL = 50000;
export const GENERATE_PROGRESS_INTERVAL = 500000;

// Search limits
export const SEARCH_RESULT_LIMIT = 20;
export const SEARCH_TERM_MAX_LENGTH = 100;
export const SEARCH_TIMEOUT_MS = 10000;

// Data generation
export const DEFAULT_ROW_COUNT = 1000000;
