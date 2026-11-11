import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/stores/ui-store";

interface TodoListSkeletonProps {
  viewMode: ViewMode;
  count?: number;
}

export function TodoListSkeleton({
  viewMode,
  count = 5,
}: TodoListSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading tasks"
      className={cn(
        viewMode === "grid"
          ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col gap-3",
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-start gap-3 p-4">
            <Skeleton className="size-4 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
