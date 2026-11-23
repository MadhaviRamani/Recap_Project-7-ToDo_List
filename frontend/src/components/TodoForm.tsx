import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";

import { createTodo, getErrorMessage, isTodosKey } from "../api";

export default function TodoForm() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter key while a request runs, or an empty title: do not send.
    if (isSubmitting || title.trim() === "") {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createTodo(title);
      setTitle("");
      // Tell SWR to load every todos list (all filters) again, so the new todo shows up.
      await mutate(isTodosKey);
    } catch (caught) {
      // Keep the typed title and the list as they are, show what went wrong.
      setError(getErrorMessage(caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="todo-form" onSubmit={handleSubmit}>
        <label htmlFor="new-todo" className="visually-hidden">
          New todo
        </label>
        <input
          id="new-todo"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What do you have to do?"
        />
        <button type="submit" disabled={isSubmitting || title.trim() === ""}>
          {isSubmitting ? "Adding…" : "Add"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
