import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

export default function App() {
  return (
    <main>
      <h1>Todos</h1>
      <TodoForm />
      <TodoList />
    </main>
  );
}
