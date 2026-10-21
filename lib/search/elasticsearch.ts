import elastic from "../elastic/client";
import { SearchResult, Product } from "./types";
import { INDEX_NAME, SEARCH_RESULT_LIMIT, SEARCH_TIMEOUT_MS } from "../data/schema";

function escapeElasticsearchWildcards(term: string): string {
  return term.replace(/[*?]/g, "\\$&");
}

export async function searchElasticsearch(term: string): Promise<SearchResult> {
  const start = performance.now();
  const escapedTerm = escapeElasticsearchWildcards(term.toLowerCase());

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Elasticsearch search timeout")), SEARCH_TIMEOUT_MS)
  );

  const searchPromise = elastic.search<Product>({
    index: INDEX_NAME,
    query: {
      query_string: {
        query: `*${escapedTerm}*`,
        fields: ["title"],
      },
    },
    size: SEARCH_RESULT_LIMIT,
    track_total_hits: true,
  });

  const response = await Promise.race([searchPromise, timeoutPromise]);

  const timeMs = Math.round(performance.now() - start);

  const totalCount =
    typeof response.hits.total === "number"
      ? response.hits.total
      : response.hits.total?.value || 0;

  const results: Product[] = response.hits.hits.map((hit) => ({
    id: hit._id || "",
    title: hit._source?.title || "",
    category: hit._source?.category || "",
    score: typeof hit._score === "number" ? hit._score : undefined,
  }));

  return {
    timeMs,
    totalCount,
    results,
  };
}
