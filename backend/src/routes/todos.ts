import { Router } from "express";

import { TodoModel, toTodo } from "../models/Todo";

export const todosRouter = Router();

// The router is mounted on /api/todos in app.ts. The contract is in docs/api-contract.md.

// GET /api/todos -> 200 with the list of todos
todosRouter.get("/", async (_request, response) => {
  const todos = await TodoModel.find();
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
