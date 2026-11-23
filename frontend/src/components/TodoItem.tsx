import {
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useSWRConfig } from "swr";

import { deleteTodo, getErrorMessage, isTodosKey, updateTodo } from "../api";
import type { Todo } from "../types";
import Icon from "./Icon";

/** Where a dragged todo would land: above or below this one. */
export type DropPlace = "before" | "after";

type TodoItemProps = {
  todo: Todo;
  /** This todo is being dragged. */
  isDragging: boolean;
  /** The dragged todo would land above or below this one, or not here (null). */
  dropPlace: DropPlace | null;
  onDragStart: (id: string) => void;
  onDragOver: (id: string, place: DropPlace) => void;
  onDragEnd: () => void;
  /** Moves this todo one place up (-1) or down (1). Resolves once the list shows the new order. */
  onMove: (id: string, direction: -1 | 1) => Promise<void>;
};

export default function TodoItem({
  todo,
  isDragging,
  dropPlace,
  onDragStart,
  onDragOver,
  onDragEnd,
  onMove,
}: TodoItemProps) {
  const { mutate } = useSWRConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [error, setError] = useState<string | null>(null);
  const itemRef = useRef<HTMLLIElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  // The handle starts the drag. The whole row is shown under the mouse.
  function handleDragStart(event: DragEvent<HTMLSpanElement>) {
    event.dataTransfer.effectAllowed = "move";
    // Firefox only starts a drag when some data is set.
    event.dataTransfer.setData("text/plain", todo.id);
    if (itemRef.current) {
      event.dataTransfer.setDragImage(itemRef.current, 16, 16);
    }
    onDragStart(todo.id);
  }

  // Over the upper half of the row the todo lands above it, over the lower half below it.
  function handleDragOver(event: DragEvent<HTMLLIElement>) {
    // Without preventDefault the browser does not allow a drop here.
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const box = event.currentTarget.getBoundingClientRect();
    onDragOver(todo.id, event.clientY < box.top + box.height / 2 ? "before" : "after");
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    // Do not scroll the page.
    event.preventDefault();
    await onMove(todo.id, event.key === "ArrowUp" ? -1 : 1);
    // React moved the row in the page, which can take the focus away: give it back.
    requestAnimationFrame(() => handleRef.current?.focus());
  }

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

  // A row being edited has no handle, but other todos can still be dropped next to it.
  const itemProps = {
    ref: itemRef,
    className: [
      "todo-item",
      isDragging && "dragging",
      dropPlace && `drop-${dropPlace}`,
    ]
      .filter(Boolean)
      .join(" "),
    onDragOver: handleDragOver,
  };

  if (isEditing) {
    const inputId = `edit-todo-${todo.id}`;
    return (
      <li {...itemProps}>
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
          <button
            type="submit"
            className="icon-button icon-button-save"
            aria-label="Save"
            title="Save"
            disabled={draftTitle.trim() === ""}
          >
            <Icon name="save" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Cancel"
            title="Cancel"
            onClick={handleCancel}
          >
            <Icon name="cancel" />
          </button>
        </form>
        {errorMessage}
      </li>
    );
  }

  return (
    <li {...itemProps}>
      {/* A span, not a button: Firefox does not start a drag on a button. */}
      <span
        ref={handleRef}
        className="drag-handle"
        role="button"
        tabIndex={0}
        aria-label={`Move ${todo.title}`}
        title="Drag to move, or use the arrow keys"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onKeyDown={handleKeyDown}
      >
        <Icon name="drag" />
      </span>
      <label className={todo.done ? "todo-title done" : "todo-title"}>
        <input type="checkbox" checked={todo.done} onChange={handleToggle} />
        {todo.title}
      </label>
      <button
        type="button"
        className="icon-button"
        aria-label="Edit"
        title="Edit"
        onClick={handleEdit}
      >
        <Icon name="edit" />
      </button>
      <button
        type="button"
        className="icon-button icon-button-danger"
        aria-label="Delete"
        title="Delete"
        onClick={handleDelete}
      >
        <Icon name="delete" />
      </button>
      {errorMessage}
    </li>
  );
}
