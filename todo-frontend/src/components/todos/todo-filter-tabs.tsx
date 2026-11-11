"use client";

import Link from "next/link";
import { useTodoStats } from "@/features/todos/hooks/use-todos";
import { cn } from "@/lib/utils";
import type { TodoStatusFilter } from "@/types";

interface TodoFilterTabsProps {
  filter: TodoStatusFilter;
}

export function TodoFilterTabs({ filter }: TodoFilterTabsProps) {
  const stats = useTodoStats();

  const tabs: Array<{
    value: TodoStatusFilter;
    label: string;
    href: string;
    count: number | undefined;
  }> = [
    {
      value: "all",
      label: "All",
      href: "/tasks",
      count: stats.isLoading ? undefined : stats.total,
    },
    {
      value: "active",
      label: "Active",
      href: "/tasks/active",
      count: stats.isLoading ? undefined : stats.active,
    },
    {
      value: "completed",
      label: "Completed",
      href: "/tasks/completed",
      count: stats.isLoading ? undefined : stats.completed,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter tasks"
      className="flex w-fit items-center gap-1 rounded-lg bg-muted p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === filter;

        return (
          <Link
            key={tab.value}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={cn(
                  "rounded px-1 text-xs tabular-nums",
                  isActive
                    ? "bg-muted text-muted-foreground"
                    : "text-muted-foreground/80",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
