import { useState } from "react";

import type { Filter } from "./api";
import TodoFilter from "./components/TodoFilter";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

export default function App() {
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <main>
      <h1>Todos</h1>
      <TodoForm />
      <TodoFilter filter={filter} onChange={setFilter} />
      <TodoList filter={filter} />
    </main>
  );
}
