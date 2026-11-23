import { useSWRConfig } from "swr";

import { updateTodo } from "../api";
import type { Todo } from "../types";

type TodoItemProps = {
  todo: Todo;
};

export default function TodoItem({ todo }: TodoItemProps) {
  const { mutate } = useSWRConfig();

  async function handleToggle() {
    // PUT replaces the whole todo: send the current title with the new done.
    await updateTodo({ ...todo, done: !todo.done });
    await mutate("/todos");
  }

  return (
    <li className="todo-item">
      <label className={todo.done ? "todo-title done" : "todo-title"}>
        <input type="checkbox" checked={todo.done} onChange={handleToggle} />
        {todo.title}
      </label>
    </li>
  );
}
