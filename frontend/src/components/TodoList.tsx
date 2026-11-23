import { useState, type DragEvent } from "react";
import useSWR, { useSWRConfig } from "swr";

import {
  fetcher,
  getErrorMessage,
  isTodosKey,
  reorderTodos,
  todosKey,
  type Filter,
} from "../api";
import type { Todo } from "../types";
import TodoItem, { type DropPlace } from "./TodoItem";

/** Returns a copy of the list with the todo at `from` moved to index `to`. */
function moveItem(todos: Todo[], from: number, to: number): Todo[] {
  const result = [...todos];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

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
  const { mutate: mutateAll } = useSWRConfig();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; place: DropPlace } | null>(
    null
  );
  const [reorderError, setReorderError] = useState<string | null>(null);

  /**
   * Shows the new order right away, then saves it. Resolves once the list shows it.
   * If saving fails, reloading brings the saved order back and the error is shown.
   */
  async function reorder(newTodos: Todo[]) {
    setReorderError(null);
    await mutate(newTodos, { revalidate: false });
    void save(newTodos.map((todo) => todo.id));
  }

  async function save(ids: string[]) {
    try {
      await reorderTodos(ids);
    } catch (caught) {
      setReorderError(getErrorMessage(caught));
    }
    // Reload every filter: the order changed in all of them (or failed and goes back).
    await mutateAll(isTodosKey);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropTarget(null);
  }

  /** Where the dragged todo is now (`from`) and where it would go (`to`), or null if it would not move. */
  function getMove(target: { id: string; place: DropPlace }) {
    if (!todos || draggedId === null) {
      return null;
    }
    const from = todos.findIndex((todo) => todo.id === draggedId);
    let to = todos.findIndex((todo) => todo.id === target.id);
    if (target.place === "after") {
      to += 1;
    }
    // Taking the todo out first shifts every later todo one place up.
    if (from < to) {
      to -= 1;
    }
    return from === -1 || to === -1 || from === to ? null : { from, to };
  }

  function handleDragOver(id: string, place: DropPlace) {
    // Ignore drags that did not start on one of our handles (e.g. text from elsewhere).
    if (draggedId === null) {
      return;
    }
    // Right next to the dragged todo nothing would change: no gap there.
    const target = getMove({ id, place }) ? { id, place } : null;
    if (dropTarget?.id !== target?.id || dropTarget?.place !== target?.place) {
      setDropTarget(target);
    }
  }

  // The drop is handled by the whole list, so a drop into the gap between two todos counts too.
  function handleListDragOver(event: DragEvent<HTMLUListElement>) {
    if (draggedId !== null) {
      // Without preventDefault the browser does not allow a drop here.
      event.preventDefault();
    }
  }

  function handleDrop(event: DragEvent<HTMLUListElement>) {
    event.preventDefault();
    const move = dropTarget && getMove(dropTarget);
    if (todos && move) {
      void reorder(moveItem(todos, move.from, move.to));
    }
    handleDragEnd();
  }

  async function handleMove(id: string, direction: -1 | 1) {
    if (!todos) {
      return;
    }
    const from = todos.findIndex((todo) => todo.id === id);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= todos.length) {
      return;
    }
    await reorder(moveItem(todos, from, to));
  }

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
    <>
      {reorderError && <p role="alert">{reorderError}</p>}
      <ul className="todo-list" onDragOver={handleListDragOver} onDrop={handleDrop}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isDragging={todo.id === draggedId}
            dropPlace={dropTarget?.id === todo.id ? dropTarget.place : null}
            onDragStart={setDraggedId}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onMove={handleMove}
          />
        ))}
      </ul>
    </>
  );
}
