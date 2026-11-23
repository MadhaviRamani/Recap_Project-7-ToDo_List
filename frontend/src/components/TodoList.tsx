import useSWR from "swr";

import { fetcher } from "../api";
import type { Todo } from "../types";
import TodoItem from "./TodoItem";

export default function TodoList() {
  const { data: todos, isLoading } = useSWR<Todo[]>("/todos", fetcher);

  if (isLoading || !todos) {
    return <p>Loading todos…</p>;
  }

  if (todos.length === 0) {
    return <p>No todos yet. Time to relax!</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
