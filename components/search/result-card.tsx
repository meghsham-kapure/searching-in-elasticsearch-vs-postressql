"use client";

import { CheckCircle2, Clock, Timer, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/demo-data";

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

function StreamMeta({ stream }: { stream: SearchResult["stream"] }) {
  const startedAt = new Date(stream.startedAt);
  const finishedAt = new Date(stream.finishedAt);
  const duration = stream.finishedAt - stream.startedAt;

  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Clock className="size-3" />
        Started&nbsp;
        <span className="font-mono text-foreground">{fmt(startedAt)}</span>
      </span>
      <span className="flex items-center gap-1">
        <CheckCircle2 className="size-3 text-emerald-500" />
        Finished&nbsp;
        <span className="font-mono text-foreground">{fmt(finishedAt)}</span>
      </span>
      <span className="flex items-center gap-1">
        <Timer className="size-3 text-amber-500" />
        <span className="font-mono text-foreground font-medium">{duration}ms</span>
      </span>
    </div>
  );
}

export function ResultCard({ result, index }: ResultCardProps) {
  const isPostgres = result.source === "postgres";

  return (
    <Card
      className={cn(
        "border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
        isPostgres
          ? "border-blue-200 dark:border-blue-900 hover:border-blue-400 dark:hover:border-blue-700"
          : "border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-700"
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5 w-5 text-right">
            {index + 1}.
          </span>
          <h3 className="font-semibold text-sm leading-snug">{result.title}</h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {result.score !== undefined && (
            <Badge
              variant="outline"
              className="text-xs font-mono gap-1 text-amber-600 border-amber-300 dark:border-amber-700 dark:text-amber-400"
            >
              <Zap className="size-3" />
              {(result.score * 100).toFixed(0)}%
            </Badge>
          )}
          <Badge
            className={cn(
              "text-xs gap-1",
              isPostgres
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800"
            )}
            variant="outline"
          >
            {isPostgres ? "Postgres" : "Elasticsearch"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed pl-7">
          {result.description}
        </p>

        {/* Highlights */}
        {result.metadata.highlights && result.metadata.highlights.length > 0 && (
          <div className="pl-7 flex flex-wrap gap-1.5">
            {result.metadata.highlights.map((h) => (
              <Badge key={h} variant="secondary" className="text-xs">
                {h}
              </Badge>
            ))}
          </div>
        )}

        {/* Source meta */}
        <div className="pl-7 text-xs text-muted-foreground font-mono">
          {isPostgres ? `table: ${result.metadata.table}` : `index: ${result.metadata.index}`}
        </div>

        <Separator className="ml-7" />

        {/* Stream meta */}
        <div className="pl-7">
          <StreamMeta stream={result.stream} />
        </div>
      </CardContent>
    </Card>
  );
}
