"use client";

import { Database, Timer, Zap } from "lucide-react";
import type { SearchResult } from "@/lib/demo-data";

interface SearchStatsBarProps {
  postgresResults: SearchResult[];
  elasticResults: SearchResult[];
  query: string;
}

function totalDuration(results: SearchResult[]) {
  if (!results.length) return 0;
  const start = Math.min(...results.map((r) => r.stream.startedAt));
  const end = Math.max(...results.map((r) => r.stream.finishedAt));
  return end - start;
}

export function SearchStatsBar({
  postgresResults,
  elasticResults,
  query,
}: SearchStatsBarProps) {
  const pgDuration = totalDuration(postgresResults);
  const esDuration = totalDuration(elasticResults);
  const total = postgresResults.length + elasticResults.length;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground border-b pb-3 mb-1">
      <span className="text-foreground font-medium">
        {total} results for{" "}
        <span className="italic">&ldquo;{query}&rdquo;</span>
      </span>

      <span className="flex items-center gap-1">
        <Database className="size-3 text-blue-500" />
        Postgres:&nbsp;
        <span className="font-mono text-foreground">{postgresResults.length}</span>
        &nbsp;results in&nbsp;
        <span className="font-mono text-foreground">{pgDuration}ms</span>
      </span>

      <span className="flex items-center gap-1">
        <Zap className="size-3 text-purple-500" />
        Elasticsearch:&nbsp;
        <span className="font-mono text-foreground">{elasticResults.length}</span>
        &nbsp;results in&nbsp;
        <span className="font-mono text-foreground">{esDuration}ms</span>
      </span>

      <span className="flex items-center gap-1">
        <Timer className="size-3 text-amber-500" />
        Total stream:&nbsp;
        <span className="font-mono text-foreground">
          {Math.max(pgDuration, esDuration)}ms
        </span>
      </span>
    </div>
  );
}
