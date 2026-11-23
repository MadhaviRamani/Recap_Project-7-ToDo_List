import { Router } from "express";

import { TodoModel, toTodo } from "../models/Todo";

export const todosRouter = Router();

// The router is mounted on /api/todos in app.ts. The contract is in docs/api-contract.md.

// GET /api/todos -> 200 with the list of todos.
// ?done=true only the done ones, ?done=false only the open ones, without `done` all of them.
// Any other value of `done` -> 400.
todosRouter.get("/", async (request, response) => {
  const { done } = request.query;
  if (done === undefined) {
    const todos = await TodoModel.find();
    response.json(todos.map(toTodo));
    return;
  }
  if (done !== "true" && done !== "false") {
    response.status(400).json({ error: "done must be true or false" });
    return;
  }
  const todos = await TodoModel.find({ done: done === "true" });
  response.json(todos.map(toTodo));
});

// POST /api/todos -> 201 with the new todo. `done` starts as false, the schema trims the title.
// A missing or empty title fails the schema: errorHandler answers 400.
todosRouter.post("/", async (request, response) => {
  // `?.`: without a JSON body, Express 5 leaves `request.body` undefined.
  const todo = await TodoModel.create({ title: request.body?.title });
  response.status(201).json(toTodo(todo));
});

// PUT /api/todos/:id -> 200 with the updated todo, 404 for an unknown id.
// An invalid id like "abc" throws a CastError: errorHandler answers 404.
todosRouter.put("/:id", async (request, response) => {
  const todo = await TodoModel.findById(request.params.id);
  if (!todo) {
    response.status(404).json({ error: "Todo not found" });
    return;
  }
  // PUT replaces both fields. save() checks the whole todo against the schema:
  // a missing or empty title or a missing done throws a ValidationError, errorHandler answers 400.
  todo.title = request.body?.title;
  todo.done = request.body?.done;
  await todo.save();
  response.json(toTodo(todo));
});

// DELETE /api/todos/:id -> 204 without a body, 404 for an unknown id (also when deleted twice).
// An invalid id like "abc" throws a CastError: errorHandler answers 404.
todosRouter.delete("/:id", async (request, response) => {
  const todo = await TodoModel.findByIdAndDelete(request.params.id);
  if (!todo) {
    response.status(404).json({ error: "Todo not found" });
    return;
  }
  response.status(204).end();
});
