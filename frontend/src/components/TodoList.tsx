import useSWR from "swr";

import { fetcher, getErrorMessage } from "../api";
import type { Todo } from "../types";
import TodoItem from "./TodoItem";

export default function TodoList() {
  const {
    data: todos,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Todo[]>("/todos", fetcher);

  // The list could not be loaded (e.g. the backend is down): show why and let the user retry.
  if (error && !todos) {
    return (
      <div className="list-error">
        <p role="alert">{getErrorMessage(error)}</p>
        <button type="button" onClick={() => mutate()} disabled={isValidating}>
          {isValidating ? "Trying again…" : "Try again"}
        </button>
      </div>
    );
  }

  if (isLoading || !todos) {
    return <p>Loading todos…</p>;
  }

  if (todos.length === 0) {
    return <p>No todos yet. Add your first todo above!</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
