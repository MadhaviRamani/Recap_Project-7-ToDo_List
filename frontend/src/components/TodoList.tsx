import useSWR from "swr";

import { fetcher, getErrorMessage, todosKey, type Filter } from "../api";
import type { Todo } from "../types";
import TodoItem from "./TodoItem";

const EMPTY_MESSAGES: Record<Filter, string> = {
  all: "No todos yet. Add your first todo above!",
  open: "No open todos. Well done!",
  done: "No done todos yet.",
};

type TodoListProps = {
  filter: Filter;
};

export default function TodoList({ filter }: TodoListProps) {
  // The filter is part of the key: the API filters, every filter has its own request.
  const {
    data: todos,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Todo[]>(todosKey(filter), fetcher);

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
    return <p>{EMPTY_MESSAGES[filter]}</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
