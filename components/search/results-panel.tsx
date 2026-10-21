"use client";

import { Database, Zap, LayoutList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ResultCard } from "@/components/search/result-card";
import { ResultCardSkeleton } from "@/components/search/result-card-skeleton";
import { ResultContainer } from "@/components/search/result-container";
import type { SearchResult } from "@/lib/demo-data";

interface ResultsPanelProps {
  postgresResults: SearchResult[];
  elasticResults: SearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
}

function ResultCount({ count }: { count: number }) {
  return (
    <Badge variant="secondary" className="text-xs ml-1.5 tabular-nums">
      {count}
    </Badge>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
      <LayoutList className="size-8 opacity-30" />
      <p className="text-sm">No {label} results found.</p>
    </div>
  );
}

function AllResultList({
  results,
  isSearching,
  label,
}: {
  results: SearchResult[];
  isSearching: boolean;
  label: string;
}) {
  if (isSearching) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (results.length === 0) return <EmptyState label={label} />;
  return (
    <div className="space-y-3">
      {results.map((r, i) => (
        <ResultCard key={r.id} result={r} index={i} />
      ))}
    </div>
  );
}

export function ResultsPanel({
  postgresResults,
  elasticResults,
  isSearching,
  hasSearched,
}: ResultsPanelProps) {
  const allResults = [...postgresResults, ...elasticResults].sort(
    (a, b) => a.stream.startedAt - b.stream.startedAt
  );

  return (
    <Tabs defaultValue="split" className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="split">
          Split view
        </TabsTrigger>
        <TabsTrigger value="all">
          All
          <ResultCount count={isSearching ? 0 : allResults.length} />
        </TabsTrigger>
        <TabsTrigger value="postgres">
          <Database className="size-3.5 mr-1.5" />
          Postgres
          <ResultCount count={isSearching ? 0 : postgresResults.length} />
        </TabsTrigger>
      </TabsList>

      {/* ── split: side-by-side containers ── */}
      <TabsContent value="split">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultContainer
            label="PostgreSQL"
            icon={Database}
            accentClass="blue"
            results={postgresResults}
            isStreaming={isSearching}
            hasSearched={hasSearched}
          />
          <ResultContainer
            label="Elasticsearch"
            icon={Zap}
            accentClass="purple"
            results={elasticResults}
            isStreaming={isSearching}
            hasSearched={hasSearched}
          />
        </div>
      </TabsContent>

      {/* ── all: merged & sorted ── */}
      <TabsContent value="all">
        <ScrollArea className="h-[calc(100vh-260px)] pr-2">
          <AllResultList
            results={allResults}
            isSearching={isSearching}
            label="combined"
          />
        </ScrollArea>
      </TabsContent>

      {/* ── postgres only ── */}
      <TabsContent value="postgres">
        <ResultContainer
          label="PostgreSQL"
          icon={Database}
          accentClass="blue"
          results={postgresResults}
          isStreaming={isSearching}
          hasSearched={hasSearched}
        />
      </TabsContent>
    </Tabs>
  );
}
