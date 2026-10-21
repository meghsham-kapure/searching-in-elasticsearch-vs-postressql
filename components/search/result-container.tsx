"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ResultCard } from "@/components/search/result-card";
import { ResultCardSkeleton } from "@/components/search/result-card-skeleton";
import { LayoutList, Loader2, CheckCircle2, Timer, LucideIcon } from "lucide-react";
import type { SearchResult } from "@/lib/demo-data";

interface ResultContainerProps {
  label: string;
  icon: LucideIcon;
  accentClass: string;           // e.g. "blue" | "purple"
  results: SearchResult[];
  isStreaming: boolean;
  hasSearched: boolean;
}

// Derives wall-clock start → finish from the result set
function streamWindow(results: SearchResult[]) {
  if (!results.length) return null;
  const start = Math.min(...results.map((r) => r.stream.startedAt));
  const end   = Math.max(...results.map((r) => r.stream.finishedAt));
  return { start, end, duration: end - start };
}

// ─── accent helpers ──────────────────────────────────────────────────────────
const ACCENT: Record<
  string,
  {
    border: string;
    header: string;
    icon: string;
    badge: string;
    streaming: string;
    done: string;
  }
> = {
  blue: {
    border:    "border-blue-200 dark:border-blue-900",
    header:    "bg-blue-50 dark:bg-blue-950/40",
    icon:      "text-blue-600 dark:text-blue-400",
    badge:     "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    streaming: "text-blue-500",
    done:      "text-emerald-500",
  },
  purple: {
    border:    "border-purple-200 dark:border-purple-900",
    header:    "bg-purple-50 dark:bg-purple-950/40",
    icon:      "text-purple-600 dark:text-purple-400",
    badge:     "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
    streaming: "text-purple-500",
    done:      "text-emerald-500",
  },
};

// ─── streaming status pill ────────────────────────────────────────────────────
function StreamStatus({
  isStreaming,
  hasSearched,
  results,
  accent,
}: {
  isStreaming: boolean;
  hasSearched: boolean;
  results: SearchResult[];
  accent: (typeof ACCENT)[string];
}) {
  if (!hasSearched) return null;

  if (isStreaming) {
    return (
      <span className={cn("flex items-center gap-1 text-xs font-medium", accent.streaming)}>
        <Loader2 className="size-3 animate-spin" />
        Streaming…
      </span>
    );
  }

  const win = streamWindow(results);
  if (!win) return null;

  return (
    <span className={cn("flex items-center gap-1 text-xs font-medium", accent.done)}>
      <CheckCircle2 className="size-3" />
      Done
      <span className="flex items-center gap-0.5 text-muted-foreground font-normal ml-1">
        <Timer className="size-3 text-amber-500" />
        <span className="font-mono">{win.duration}ms</span>
      </span>
    </span>
  );
}

// ─── empty / pre-search state ─────────────────────────────────────────────────
function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-muted-foreground gap-2">
      <LayoutList className="size-6 opacity-25" />
      <p className="text-xs">No {label} results.</p>
    </div>
  );
}

function Idle({ icon: Icon, accentClass }: { icon: LucideIcon; accentClass: string }) {
  const accent = ACCENT[accentClass] ?? ACCENT.blue;
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground gap-3">
      <Icon className={cn("size-8 opacity-20", accent.icon)} />
      <p className="text-xs opacity-50">Run a search to see results here.</p>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export function ResultContainer({
  label,
  icon: Icon,
  accentClass,
  results,
  isStreaming,
  hasSearched,
}: ResultContainerProps) {
  const accent = ACCENT[accentClass] ?? ACCENT.blue;
  const win = streamWindow(results);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border overflow-hidden",
        accent.border
      )}
    >
      {/* ── header ── */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3",
          accent.header
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4 shrink-0", accent.icon)} />
          <span className="text-sm font-semibold">{label}</span>
          {!isStreaming && results.length > 0 && (
            <Badge variant="outline" className={cn("text-xs tabular-nums", accent.badge)}>
              {results.length}
            </Badge>
          )}
        </div>

        <StreamStatus
          isStreaming={isStreaming}
          hasSearched={hasSearched}
          results={results}
          accent={accent}
        />
      </div>

      <Separator />

      {/* ── timing sub-header ── */}
      {win && !isStreaming && (
        <>
          <div className="flex items-center gap-4 px-4 py-1.5 text-[11px] text-muted-foreground bg-muted/30">
            <span>
              Started&nbsp;
              <span className="font-mono text-foreground">
                {new Date(win.start).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  fractionalSecondDigits: 3,
                })}
              </span>
            </span>
            <span>
              Finished&nbsp;
              <span className="font-mono text-foreground">
                {new Date(win.end).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  fractionalSecondDigits: 3,
                })}
              </span>
            </span>
          </div>
          <Separator />
        </>
      )}

      {/* ── body ── */}
      <ScrollArea className="flex-1 h-[calc(100vh-320px)]">
        <div className="p-3 space-y-2.5">
          {isStreaming ? (
            <>
              <ResultCardSkeleton />
              <ResultCardSkeleton />
              <ResultCardSkeleton />
            </>
          ) : !hasSearched ? (
            <Idle icon={Icon} accentClass={accentClass} />
          ) : results.length === 0 ? (
            <Empty label={label} />
          ) : (
            results.map((r, i) => (
              <ResultCard key={r.id} result={r} index={i} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
