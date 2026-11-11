"use client";

import { LayoutGrid, List, Loader2 } from "lucide-react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TodoEmptyState } from "@/components/todos/todo-empty-state";
import { TodoErrorState } from "@/components/todos/todo-error-state";
import { TodoFilterTabs } from "@/components/todos/todo-filter-tabs";
import { TodoItem } from "@/components/todos/todo-item";
import { TodoListSkeleton } from "@/components/todos/todo-skeleton";
import { TodoPagination } from "@/components/todos/todo-pagination";
import { useTodos } from "@/features/todos/hooks/use-todos";
import { cn } from "@/lib/utils";
import { useUIStore, type ViewMode } from "@/stores/ui-store";
import type { TodoFilters, TodoStatusFilter } from "@/types";

const DEFAULT_PAGE_SIZE = 10;

interface TodoListViewProps {
  filter: TodoStatusFilter;
}

export function TodoListView({ filter }: TodoListViewProps) {
  const search = useUIStore((state) => state.search);
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

  const resetKey = `${filter}|${search}|${limit}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  const filters: TodoFilters = { page, limit };
  if (filter === "active") {
    filters.completed = false;
  } else if (filter === "completed") {
    filters.completed = true;
  }
  if (search) {
    filters.search = search;
  }

  const query = useTodos(filters);
  const todos = query.data?.data ?? [];
  const meta = query.data?.meta;

  if (meta && meta.totalPages > 0 && page > meta.totalPages) {
    setPage(meta.totalPages);
  }

  const isRefreshing = query.isFetching && !query.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TodoFilterTabs filter={filter} />

        <div className="flex items-center gap-2">
          {isRefreshing ? (
            <Loader2
              className="size-4 animate-spin text-muted-foreground"
              aria-label="Refreshing tasks"
            />
          ) : null}
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={viewMode}
            onValueChange={(value) => {
              if (value) setViewMode(value as ViewMode);
            }}
            aria-label="View mode"
          >
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {query.isPending ? (
        <TodoListSkeleton viewMode={viewMode} count={limit > 10 ? 10 : limit} />
      ) : query.isError ? (
        <TodoErrorState
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : todos.length === 0 ? (
        <TodoEmptyState filter={filter} hasSearch={Boolean(search)} />
      ) : (
        <>
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-3",
              query.isPlaceholderData && "opacity-60 transition-opacity",
            )}
          >
            {todos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>

          {meta ? (
            <TodoPagination
              meta={meta}
              limit={limit}
              disabled={query.isFetching}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
