const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

interface ErrorPayload {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: options.body !== undefined
        ? { "Content-Type": "application/json" }
        : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Could not reach the API. Check your connection and try again.",
      0,
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let details: string[] | undefined;

    try {
      const payload = (await response.json()) as ErrorPayload;
      if (Array.isArray(payload.message)) {
        details = payload.message;
        message = payload.message.join(", ");
      } else if (typeof payload.message === "string") {
        message = payload.message;
      }
    } catch {
      // Non-JSON error body; keep the generic message.
    }

    throw new ApiError(message, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
