"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ResultCardSkeleton() {
  return (
    <Card className="border">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <Skeleton className="h-4 w-4 shrink-0 mt-0.5 rounded-sm" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5 pl-7">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
        <div className="pl-7 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="pl-7">
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-px ml-7" />
        <div className="pl-7 flex gap-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
