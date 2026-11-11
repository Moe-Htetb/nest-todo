"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTodo,
  useUpdateTodo,
} from "@/features/todos/hooks/use-todos";
import {
  todoSchema,
  type TodoFormValues,
} from "@/features/todos/schemas/todo-schema";
import type { Todo } from "@/types";

const DESCRIPTION_MAX_LENGTH = 2000;

interface TodoFormProps {
  todo?: Todo;
  onDone: () => void;
}

export function TodoForm({ todo, onDone }: TodoFormProps) {
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const isPending = createTodo.isPending || updateTodo.isPending;

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo?.title ?? "",
      description: todo?.description ?? "",
    },
  });

  const description = useWatch({ control: form.control, name: "description" }) ?? "";

  async function onSubmit(values: TodoFormValues) {
    const trimmedDescription = values.description?.trim();

    try {
      if (todo) {
        await updateTodo.mutateAsync({
          id: todo.id,
          input: {
            title: values.title.trim(),
            description: trimmedDescription ? trimmedDescription : null,
          },
        });
      } else {
        await createTodo.mutateAsync({
          title: values.title.trim(),
          description: trimmedDescription || undefined,
        });
      }
      form.reset();
      onDone();
    } catch {
      // Mutation hooks already surface the error through a toast.
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="What needs to be done?"
                  autoFocus
                  maxLength={255}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Description</FormLabel>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Add more details (optional)"
                  rows={4}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {todo ? "Saving..." : "Creating..."}
              </>
            ) : todo ? (
              "Save changes"
            ) : (
              "Create task"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
