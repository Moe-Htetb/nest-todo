"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginationMeta } from "@/types";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface TodoPaginationProps {
  meta: PaginationMeta;
  limit: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function TodoPagination({
  meta,
  limit,
  disabled = false,
  onPageChange,
  onLimitChange,
}: TodoPaginationProps) {
  const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground tabular-nums">
          {start}&ndash;{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground tabular-nums">
          {meta.total}
        </span>{" "}
        tasks
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-20" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground tabular-nums">
          Page {meta.page} of {Math.max(meta.totalPages, 1)}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Previous page"
            disabled={disabled || !meta.hasPreviousPage}
            onClick={() => onPageChange(meta.page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Next page"
            disabled={disabled || !meta.hasNextPage}
            onClick={() => onPageChange(meta.page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
