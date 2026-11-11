"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TodoForm } from "@/components/todos/todo-form";
import { useTodo } from "@/features/todos/hooks/use-todos";
import { useUIStore } from "@/stores/ui-store";

export function TodoFormDialog() {
  const isOpen = useUIStore((state) => state.isTodoDialogOpen);
  const selectedTodoId = useUIStore((state) => state.selectedTodoId);
  const setTodoDialogOpen = useUIStore((state) => state.setTodoDialogOpen);
  const closeTodoDialog = useUIStore((state) => state.closeTodoDialog);

  const todoQuery = useTodo(selectedTodoId);
  const isEditing = Boolean(selectedTodoId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          setTodoDialogOpen(true);
        } else {
          closeTodoDialog();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this task."
              : "Add a task to keep your day on track."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && todoQuery.isPending ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading task">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : isEditing && todoQuery.isError ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              Could not load this task. {todoQuery.error.message}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void todoQuery.refetch()}
              >
                Try again
              </Button>
              <Button variant="ghost" size="sm" onClick={closeTodoDialog}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <TodoForm
            key={selectedTodoId ?? "new"}
            todo={isEditing ? todoQuery.data : undefined}
            onDone={closeTodoDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
