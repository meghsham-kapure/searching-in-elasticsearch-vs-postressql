"use client";

import { SearchForm } from "@/components/search-demo/search-form";
import { EngineCard } from "@/components/search-demo/engine-card";
import { useSearchStream } from "@/components/search-demo/use-search-stream";

export default function SearchDemoPage() {
  const { postgres, elasticsearch, isSearching, error, search } = useSearchStream();

  const pgTime = postgres?.timeMs;
  const esTime = elasticsearch?.timeMs;

  const pgSuccess = Boolean(postgres && !postgres.error && postgres.timeMs !== undefined);
  const esSuccess = Boolean(elasticsearch && !elasticsearch.error && elasticsearch.timeMs !== undefined);

  const isFastestPg =
    pgSuccess &&
    (!esSuccess || (esTime !== undefined && pgTime !== undefined && pgTime < esTime));

  const isFastestEs =
    esSuccess &&
    (!pgSuccess || (pgTime !== undefined && esTime !== undefined && esTime < pgTime));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Search Speed Comparison</h1>
          <p className="text-muted-foreground">
            Compare PostgreSQL ILIKE vs Elasticsearch query performance on the same dataset
          </p>
        </div>

        <SearchForm onSearch={search} isSearching={isSearching} />

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EngineCard
            engine="postgres"
            data={postgres}
            isSearching={isSearching}
            isFastest={isFastestPg}
          />
          <EngineCard
            engine="elasticsearch"
            data={elasticsearch}
            isSearching={isSearching}
            isFastest={isFastestEs}
          />
        </div>
      </div>
    </div>
  );
}
