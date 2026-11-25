import type { Todo } from "./types";

// The backend allows requests from http://localhost:5173 (CORS), so the frontend can call it directly.
export const API_URL = "http://localhost:3001/api";

// All functions that talk to the API live here, so that components never call `fetch` themselves.

/**
 * Calls the API. When the backend is down, `fetch` throws a TypeError like "Failed to fetch":
 * turn it into a message the user understands.
 */
async function request(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
}

/** Throws an Error with the API's `{ "error": "..." }` message. */
async function throwApiError(response: Response): Promise<never> {
  const fallback = `Request failed with status ${response.status}`;
  let message = fallback;
  try {
    const body = (await response.json()) as { error?: string };
    message = body.error ?? fallback;
  } catch {
    // The body is not JSON: keep the fallback message.
  }
  throw new Error(message);
}

/** Turns anything a failed call threw into a message for the UI. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

/** Which todos the list shows. */
export type Filter = "all" | "open" | "done";

/** The SWR key (path after /api) for a filter: every filter has its own request. */
export function todosKey(filter: Filter): string {
  if (filter === "open") {
    return "/todos?done=false";
  }
  if (filter === "done") {
    return "/todos?done=true";
  }
  return "/todos";
}

/** Matches the SWR keys of every todos list, so `mutate(isTodosKey)` reloads all filters. */
export function isTodosKey(key: unknown): boolean {
  return typeof key === "string" && key.startsWith("/todos");
}

/** Fetcher for `useSWR`: the key is the path after /api, e.g. "/todos". */
export async function fetcher<T>(path: string): Promise<T> {
  const response = await request(path);
  if (!response.ok) {
    return throwApiError(response);
  }
  return response.json() as Promise<T>;
}

/** Creates a todo. Throws an Error with the API's message when the request fails. */
export async function createTodo(title: string): Promise<Todo> {
  const response = await request("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    return throwApiError(response);
  }
  return response.json() as Promise<Todo>;
}

/** Replaces a todo: always sends both `title` and `done`. Throws on an error. */
export async function updateTodo(todo: Todo): Promise<Todo> {
  const response = await request(`/todos/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: todo.title, done: todo.done }),
  });
  if (!response.ok) {
    return throwApiError(response);
  }
  return response.json() as Promise<Todo>;
}

/** Saves a new order: the ids of the shown todos, top first. The 204 answer has no body. Throws on an error. */
export async function reorderTodos(ids: string[]): Promise<void> {
  const response = await request("/todos/order", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    return throwApiError(response);
  }
}

/** Deletes a todo. The 204 answer has no body, so it is not parsed. Throws on an error. */
export async function deleteTodo(id: string): Promise<void> {
  const response = await request(`/todos/${id}`, { method: "DELETE" });
  if (!response.ok) {
    return throwApiError(response);
  }
}
