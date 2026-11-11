import { apiRequest } from "@/lib/api-client";
import type {
  CreateTodoInput,
  DeleteTodoResponse,
  PaginatedResponse,
  Todo,
  TodoFilters,
  UpdateTodoInput,
} from "@/types";

function buildQueryString(filters: TodoFilters): string {
  const params = new URLSearchParams();

  if (filters.completed !== undefined) {
    params.set("completed", String(filters.completed));
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));

  return params.toString();
}

export function listTodos(
  filters: TodoFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Todo>> {
  return apiRequest<PaginatedResponse<Todo>>(
    `/todos?${buildQueryString(filters)}`,
    { signal },
  );
}

export function getTodo(id: string, signal?: AbortSignal): Promise<Todo> {
  return apiRequest<Todo>(`/todos/${id}`, { signal });
}

export function createTodo(input: CreateTodoInput): Promise<Todo> {
  return apiRequest<Todo>("/todos", { method: "POST", body: input });
}

export function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Promise<Todo> {
  return apiRequest<Todo>(`/todos/${id}`, { method: "PATCH", body: input });
}

export function deleteTodo(id: string): Promise<DeleteTodoResponse> {
  return apiRequest<DeleteTodoResponse>(`/todos/${id}`, { method: "DELETE" });
}
