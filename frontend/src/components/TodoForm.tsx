import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";

import { createTodo } from "../api";

export default function TodoForm() {
  const [title, setTitle] = useState("");
  const { mutate } = useSWRConfig();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createTodo(title);
    setTitle("");
    // Tell SWR to load the list again, so the new todo shows up.
    await mutate("/todos");
  }

  return (
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
      <button type="submit" disabled={title.trim() === ""}>
        Add
      </button>
    </form>
  );
}
