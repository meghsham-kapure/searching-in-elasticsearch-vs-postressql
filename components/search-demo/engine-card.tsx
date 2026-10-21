"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database, Zap, Clock, AlertCircle } from "lucide-react";
import { StreamMessage, Engine } from "@/lib/search/types";
import { ResultsList } from "./results-list";
import { cn } from "@/lib/utils";

interface EngineCardProps {
  engine: Engine;
  data: StreamMessage | null;
  isSearching: boolean;
  isFastest: boolean;
}

const ENGINE_CONFIG = {
  postgres: {
    icon: Database,
    title: "PostgreSQL",
    color: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  elasticsearch: {
    icon: Zap,
    title: "Elasticsearch",
    color: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export function EngineCard({ engine, data, isSearching, isFastest }: EngineCardProps) {
  const config = ENGINE_CONFIG[engine];
  const Icon = config.icon;

  return (
    <Card className={cn("h-full", isFastest && data && !data.error && "ring-2 ring-green-500")}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("size-5", config.color)} />
            <span>{config.title}</span>
          </div>
          {isFastest && data && !data.error && (
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
              Fastest
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {data?.error ? (
          <div className="flex items-start gap-2 p-3 border border-red-200 bg-red-50 rounded">
            <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{data.error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="font-mono font-medium">
                  {data?.timeMs !== undefined ? `${data.timeMs}ms` : "—"}
                </span>
              </div>
              <span className="text-muted-foreground">
                {data?.totalCount !== undefined
                  ? `${data.totalCount.toLocaleString()} results`
                  : "—"}
              </span>
            </div>

            <Separator />

            <ResultsList
              results={data?.results || []}
              isLoading={isSearching && !data}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
