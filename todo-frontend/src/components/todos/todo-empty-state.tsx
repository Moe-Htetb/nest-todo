"use client";

import { Inbox, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUIStore } from "@/stores/ui-store";
import type { TodoStatusFilter } from "@/types";

interface TodoEmptyStateProps {
  filter: TodoStatusFilter;
  hasSearch: boolean;
}

const copy: Record<TodoStatusFilter, { title: string; description: string }> = {
  all: {
    title: "Your board is empty",
    description: "Create your first task and start making progress.",
  },
  active: {
    title: "Nothing active right now",
    description: "Every task is checked off. Add something new when you are ready.",
  },
  completed: {
    title: "No completed tasks yet",
    description: "Finish a task and it will show up here.",
  },
};

export function TodoEmptyState({ filter, hasSearch }: TodoEmptyStateProps) {
  const openCreateDialog = useUIStore((state) => state.openCreateDialog);
  const content = copy[filter];

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {hasSearch ? <Search className="size-6" /> : <Inbox className="size-6" />}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {hasSearch ? "No tasks match your search" : content.title}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {hasSearch
              ? "Try a different keyword or clear the search to see everything."
              : content.description}
          </p>
        </div>
        {!hasSearch ? (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="size-4" />
            Create task
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
