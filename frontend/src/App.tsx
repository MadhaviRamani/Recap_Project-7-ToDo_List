import { useState } from "react";

import type { Filter } from "./api";
import TodoFilter from "./components/TodoFilter";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

export default function App() {
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <main>
      <h1 className="logo">
        {/* Screen readers read "Todos"; the drawn logo is decorative. */}
        <span className="visually-hidden">Todos</span>
        <span className="logo-text" aria-hidden="true">
          TOD
          {/* The last "O": an orange circle with a check mark. */}
          <svg
            className="logo-o"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16.5 8.5 10.5 15l-3-3" />
          </svg>
        </span>
      </h1>
      <TodoFilter filter={filter} onChange={setFilter} />
      <TodoForm />
      <section className="todo-card" aria-label="Todo list">
        <TodoList filter={filter} />
      </section>
    </main>
  );
}
