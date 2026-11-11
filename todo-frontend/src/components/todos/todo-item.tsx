"use client";

import { format } from "date-fns";
import { Calendar, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteTodo,
  useToggleTodo,
} from "@/features/todos/hooks/use-todos";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const openEditDialog = useUIStore((state) => state.openEditDialog);

  const isToggling =
    toggleTodo.isPending && toggleTodo.variables?.id === todo.id;
  const isDeleting =
    deleteTodo.isPending && deleteTodo.variables === todo.id;

  return (
    <>
      <Card
        className={cn(
          "transition-colors",
          todo.completed && "bg-muted/40",
          isDeleting && "pointer-events-none opacity-60",
        )}
      >
        <CardContent className="flex items-start gap-3 p-4">
          <Checkbox
            checked={todo.completed}
            disabled={isToggling || isDeleting}
            aria-label={`Mark "${todo.title}" as ${
              todo.completed ? "active" : "completed"
            }`}
            className="mt-0.5"
            onCheckedChange={() =>
              toggleTodo.mutate({
                id: todo.id,
                completed: !todo.completed,
              })
            }
          />

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p
                className={cn(
                  "text-sm font-medium break-words",
                  todo.completed && "text-muted-foreground line-through",
                )}
              >
                {todo.title}
              </p>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mt-1 size-8 shrink-0 text-muted-foreground"
                    aria-label={`Actions for "${todo.title}"`}
                  >
                    {isToggling ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="size-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onSelect={() => openEditDialog(todo.id)}
                  >
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onSelect={() => setConfirmOpen(true)}
                  >
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {todo.description ? (
              <p className="line-clamp-2 text-sm whitespace-pre-line text-muted-foreground">
                {todo.description}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span
                className="inline-flex items-center gap-1"
                suppressHydrationWarning
              >
                <Calendar className="size-3" />
                {format(new Date(todo.createdAt), "MMM d, yyyy")}
              </span>
              <span className="hidden sm:inline" suppressHydrationWarning>
                Updated{" "}
                {format(new Date(todo.updatedAt), "MMM d, yyyy, h:mm a")}
              </span>
              <Badge
                variant={todo.completed ? "secondary" : "outline"}
                className="ml-auto"
              >
                {todo.completed ? "Completed" : "Active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{todo.title}&rdquo; will be permanently removed. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTodo.mutate(todo.id)}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
