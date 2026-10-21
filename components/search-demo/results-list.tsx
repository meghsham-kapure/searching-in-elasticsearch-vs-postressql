"use client";

import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/search/types";

interface ResultsListProps {
  results: Product[];
  isLoading: boolean;
}

export function ResultsList({ results, isLoading }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3 border rounded animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No results found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((product, index) => (
        <div key={`${product.id}-${index}`} className="p-3 border rounded hover:bg-muted/50 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm flex-1">{product.title}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              {product.score !== undefined && (
                <Badge variant="outline" className="text-xs font-mono text-purple-700 bg-purple-50 border-purple-200">
                  _score: {product.score.toFixed(2)}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
