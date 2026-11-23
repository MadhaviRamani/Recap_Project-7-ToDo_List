import type { Todo } from "../types";

type TodoItemProps = {
  todo: Todo;
};

export default function TodoItem({ todo }: TodoItemProps) {
  return (
    <li className="todo-item">
      <label className={todo.done ? "todo-title done" : "todo-title"}>
        {/* Read-only for now: ticking a todo off comes in issue 4. */}
        <input type="checkbox" checked={todo.done} readOnly />
        {todo.title}
      </label>
    </li>
  );
}
