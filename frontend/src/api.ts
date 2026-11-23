import type { Todo } from "./types";

// The backend allows requests from http://localhost:5173 (CORS), so the frontend can call it directly.
export const API_URL = "http://localhost:3001/api";

// All functions that talk to the API live here, so that components never call `fetch` themselves.

/** Fetcher for `useSWR`: the key is the path after /api, e.g. "/todos". */
export async function fetcher<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/** Throws an Error with the API's `{ "error": "..." }` message. */
async function throwApiError(response: Response): Promise<never> {
  const body = (await response.json()) as { error?: string };
  throw new Error(body.error ?? `Request failed with status ${response.status}`);
}

/** Creates a todo. Throws an Error with the API's message when the request fails. */
export async function createTodo(title: string): Promise<Todo> {
  const response = await fetch(`${API_URL}/todos`, {
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
  const response = await fetch(`${API_URL}/todos/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: todo.title, done: todo.done }),
  });
  if (!response.ok) {
    return throwApiError(response);
  }
  return response.json() as Promise<Todo>;
}
