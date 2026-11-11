"use client";

import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Inbox, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodos, useToggleTodo } from "@/features/todos/hooks/use-todos";
import { cn } from "@/lib/utils";

const RECENT_LIMIT = 5;

export function RecentTodos() {
  const query = useTodos({ page: 1, limit: RECENT_LIMIT });
  const toggleTodo = useToggleTodo();
  const todos = query.data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">Recent tasks</CardTitle>
          <CardDescription>The latest additions to your board.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/tasks">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: RECENT_LIMIT }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-muted-foreground">
              {query.error.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        ) : todos.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <Inbox className="size-5" />
            No tasks yet. Create your first one to see it here.
          </div>
        ) : (
          <ul className="divide-y">
            {todos.map((todo) => {
              const isToggling =
                toggleTodo.isPending && toggleTodo.variables?.id === todo.id;

              return (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <Checkbox
                    checked={todo.completed}
                    disabled={isToggling}
                    aria-label={`Mark "${todo.title}" as ${
                      todo.completed ? "active" : "completed"
                    }`}
                    onCheckedChange={() =>
                      toggleTodo.mutate({
                        id: todo.id,
                        completed: !todo.completed,
                      })
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        todo.completed &&
                          "text-muted-foreground line-through",
                      )}
                    >
                      {todo.title}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {formatDistanceToNow(new Date(todo.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={todo.completed ? "secondary" : "outline"}
                    className="hidden sm:inline-flex"
                  >
                    {todo.completed ? "Completed" : "Active"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
