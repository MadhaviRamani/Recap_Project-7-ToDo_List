import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";

import { deleteTodo, updateTodo } from "../api";
import type { Todo } from "../types";

type TodoItemProps = {
  todo: Todo;
};

export default function TodoItem({ todo }: TodoItemProps) {
  const { mutate } = useSWRConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);

  async function handleToggle() {
    // PUT replaces the whole todo: send the current title with the new done.
    await updateTodo({ ...todo, done: !todo.done });
    await mutate("/todos");
  }

  function handleEdit() {
    setDraftTitle(todo.title);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraftTitle(todo.title);
    setIsEditing(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draftTitle.trim();
    // An empty title is never sent (the API would answer 400).
    if (title === "") {
      return;
    }
    // PUT replaces the whole todo: send the new title with the current done.
    await updateTodo({ ...todo, title });
    await mutate("/todos");
    setIsEditing(false);
  }

  async function handleDelete() {
    await deleteTodo(todo.id);
    await mutate("/todos");
  }

  if (isEditing) {
    const inputId = `edit-todo-${todo.id}`;
    return (
      <li className="todo-item">
        <form className="todo-edit-form" onSubmit={handleSave}>
          <label htmlFor={inputId} className="visually-hidden">
            Edit title
          </label>
          <input
            id={inputId}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            autoFocus
          />
          <button type="submit" disabled={draftTitle.trim() === ""}>
            Save
          </button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="todo-item">
      <label className={todo.done ? "todo-title done" : "todo-title"}>
        <input type="checkbox" checked={todo.done} onChange={handleToggle} />
        {todo.title}
      </label>
      <button type="button" onClick={handleEdit}>
        Edit
      </button>
      <button type="button" onClick={handleDelete}>
        Delete
      </button>
    </li>
  );
}
