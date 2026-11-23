import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";

import { deleteTodo, getErrorMessage, isTodosKey, updateTodo } from "../api";
import type { Todo } from "../types";

type TodoItemProps = {
  todo: Todo;
};

export default function TodoItem({ todo }: TodoItemProps) {
  const { mutate } = useSWRConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setError(null);
    try {
      // PUT replaces the whole todo: send the current title with the new done.
      await updateTodo({ ...todo, done: !todo.done });
      await mutate(isTodosKey);
    } catch (caught) {
      // The list is not reloaded, so the checkbox keeps its old state.
      setError(getErrorMessage(caught));
    }
  }

  function handleEdit() {
    setDraftTitle(todo.title);
    setError(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraftTitle(todo.title);
    setError(null);
    setIsEditing(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draftTitle.trim();
    // An empty title is never sent (the API would answer 400).
    if (title === "") {
      return;
    }
    setError(null);
    try {
      // PUT replaces the whole todo: send the new title with the current done.
      await updateTodo({ ...todo, title });
      await mutate(isTodosKey);
      setIsEditing(false);
    } catch (caught) {
      // Stay in edit mode: the typed text is kept.
      setError(getErrorMessage(caught));
    }
  }

  async function handleDelete() {
    setError(null);
    try {
      await deleteTodo(todo.id);
      await mutate(isTodosKey);
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  const errorMessage = error && (
    <p role="alert" className="todo-item-error">
      {error}
    </p>
  );

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
        {errorMessage}
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
      {errorMessage}
    </li>
  );
}
