"use client";

import {
  CircleCheckBig,
  CircleDashed,
  ListTodo,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { useTodoStats } from "@/features/todos/hooks/use-todos";

export function DashboardStats() {
  const stats = useTodoStats();

  if (stats.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-9 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stats.isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-6">
          <p className="text-sm font-medium">Could not load task stats</p>
          <p className="text-sm text-muted-foreground">
            {stats.error?.message ?? "The API did not respond as expected."}
          </p>
          <Button variant="outline" size="sm" onClick={stats.refetch}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total tasks"
        value={stats.total}
        hint="Everything on your board"
        icon={ListTodo}
      />
      <StatCard
        label="Active"
        value={stats.active}
        hint="Still in progress"
        icon={CircleDashed}
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        hint="Checked off the list"
        icon={CircleCheckBig}
      />
      <StatCard
        label="Completion rate"
        value={`${stats.completionRate}%`}
        hint={
          stats.total === 0
            ? "Add a task to get started"
            : `${stats.completed} of ${stats.total} tasks done`
        }
        icon={TrendingUp}
      >
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stats.completionRate}
          aria-label="Completion rate"
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </StatCard>
    </div>
  );
}
