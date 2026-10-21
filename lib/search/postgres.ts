import pool from "../db/client";
import { SearchResult, Product } from "./types";
import { TABLE_NAME, SEARCH_RESULT_LIMIT, SEARCH_TIMEOUT_MS } from "../data/schema";

function escapeWildcards(term: string): string {
  return term.replace(/[%_]/g, "\\$&");
}

export async function searchPostgres(term: string): Promise<SearchResult> {
  const start = performance.now();
  const escapedTerm = escapeWildcards(term);
  const pattern = `%${escapedTerm}%`;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("PostgreSQL search timeout")), SEARCH_TIMEOUT_MS)
  );

  const searchPromise = Promise.all([
    pool.query<Product>(
      `SELECT id, title, category FROM ${TABLE_NAME} WHERE title ILIKE $1 LIMIT $2`,
      [pattern, SEARCH_RESULT_LIMIT]
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE title ILIKE $1`,
      [pattern]
    ),
  ]);

  const [resultsQuery, countQuery] = await Promise.race([searchPromise, timeoutPromise]);

  const timeMs = Math.round(performance.now() - start);

  return {
    timeMs,
    totalCount: parseInt(countQuery.rows[0].count, 10),
    results: resultsQuery.rows,
  };
}
