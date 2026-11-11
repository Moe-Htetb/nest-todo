export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TodoFilters {
  completed?: boolean;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export interface DeleteTodoResponse {
  message: string;
}

export type TodoStatusFilter = "all" | "active" | "completed";
