"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTodo,
  deleteTodo,
  getTodo,
  listTodos,
  updateTodo,
} from "@/features/todos/api/todo-api";
import type {
  CreateTodoInput,
  PaginatedResponse,
  Todo,
  TodoFilters,
  UpdateTodoInput,
} from "@/types";

export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

export function useTodos(filters: TodoFilters) {
  return useQuery({
    queryKey: todoKeys.list(filters),
    queryFn: ({ signal }) => listTodos(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useTodo(id: string | null) {
  return useQuery({
    queryKey: todoKeys.detail(id ?? "unknown"),
    queryFn: ({ signal }) => getTodo(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: () => {
      toast.success("Task created");
    },
    onError: (error) => {
      toast.error("Could not create task", { description: error.message });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

interface UpdateTodoVariables {
  id: string;
  input: UpdateTodoInput;
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateTodoVariables) => updateTodo(id, input),
    onSuccess: () => {
      toast.success("Task updated");
    },
    onError: (error) => {
      toast.error("Could not update task", { description: error.message });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

interface ToggleTodoVariables {
  id: string;
  completed: boolean;
}

interface ToggleTodoContext {
  previousLists: Array<[QueryKey, PaginatedResponse<Todo> | undefined]>;
  previousDetail: Todo | undefined;
}

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, ToggleTodoVariables, ToggleTodoContext>({
    mutationFn: ({ id, completed }) => updateTodo(id, { completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });

      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Todo>
      >({ queryKey: todoKeys.lists() });
      const previousDetail = queryClient.getQueryData<Todo>(
        todoKeys.detail(id),
      );

      for (const [key, data] of previousLists) {
        if (!data) continue;
        queryClient.setQueryData<PaginatedResponse<Todo>>(key, {
          ...data,
          data: data.data.map((todo) =>
            todo.id === id ? { ...todo, completed } : todo,
          ),
        });
      }

      if (previousDetail) {
        queryClient.setQueryData<Todo>(todoKeys.detail(id), {
          ...previousDetail,
          completed,
        });
      }

      return { previousLists, previousDetail };
    },
    onError: (error, variables, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(
          todoKeys.detail(variables.id),
          context.previousDetail,
        );
      }
      toast.error("Could not update task", { description: error.message });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) });
      toast.success("Task deleted");
    },
    onError: (error) => {
      toast.error("Could not delete task", { description: error.message });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

const STATS_LIMIT = 1;

export function useTodoStats() {
  const allQuery = useQuery({
    queryKey: todoKeys.list({ page: 1, limit: STATS_LIMIT }),
    queryFn: ({ signal }) =>
      listTodos({ page: 1, limit: STATS_LIMIT }, signal),
  });

  const activeQuery = useQuery({
    queryKey: todoKeys.list({ completed: false, page: 1, limit: STATS_LIMIT }),
    queryFn: ({ signal }) =>
      listTodos({ completed: false, page: 1, limit: STATS_LIMIT }, signal),
  });

  const completedQuery = useQuery({
    queryKey: todoKeys.list({ completed: true, page: 1, limit: STATS_LIMIT }),
    queryFn: ({ signal }) =>
      listTodos({ completed: true, page: 1, limit: STATS_LIMIT }, signal),
  });

  const total = allQuery.data?.meta.total ?? 0;
  const active = activeQuery.data?.meta.total ?? 0;
  const completed = completedQuery.data?.meta.total ?? 0;

  return {
    total,
    active,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    isLoading:
      allQuery.isPending || activeQuery.isPending || completedQuery.isPending,
    isError: allQuery.isError || activeQuery.isError || completedQuery.isError,
    error:
      allQuery.error ?? activeQuery.error ?? completedQuery.error ?? undefined,
    refetch: () => {
      void Promise.all([
        allQuery.refetch(),
        activeQuery.refetch(),
        completedQuery.refetch(),
      ]);
    },
  };
}
