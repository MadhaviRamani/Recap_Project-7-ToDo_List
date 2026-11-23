import { Router } from "express";

import { TodoModel, toTodo } from "../models/Todo";

export const todosRouter = Router();

// The router is mounted on /api/todos in app.ts. The contract is in docs/api-contract.md.

// Lists are sorted by position, then by creation (an ObjectId grows with time).
const BY_POSITION = { position: 1, _id: 1 } as const;

/** True for a list of strings without duplicates, the body of PUT /api/todos/order. */
function isIdList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => typeof item === "string") &&
    new Set(value).size === value.length
  );
}

// GET /api/todos -> 200 with the list of todos.
// ?done=true only the done ones, ?done=false only the open ones, without `done` all of them.
// Any other value of `done` -> 400.
todosRouter.get("/", async (request, response) => {
  const { done } = request.query;
  if (done === undefined) {
    const todos = await TodoModel.find().sort(BY_POSITION);
    response.json(todos.map(toTodo));
    return;
  }
  if (done !== "true" && done !== "false") {
    response.status(400).json({ error: "done must be true or false" });
    return;
  }
  const todos = await TodoModel.find({ done: done === "true" }).sort(BY_POSITION);
  response.json(todos.map(toTodo));
});

// POST /api/todos -> 201 with the new todo. `done` starts as false, the schema trims the title.
// A missing or empty title fails the schema: errorHandler answers 400.
// The new todo goes to the end of the list: one place after the highest position.
todosRouter.post("/", async (request, response) => {
  const last = await TodoModel.findOne().sort({ position: -1 });
  const position = (last?.position ?? -1) + 1;
  // `?.`: without a JSON body, Express 5 leaves `request.body` undefined.
  const todo = await TodoModel.create({ title: request.body?.title, position });
  response.status(201).json(toTodo(todo));
});

// PUT /api/todos/order -> 204 without a body. Body: { "ids": [...] }, the todos in their new order.
// Only the given todos move, among the places they hold now: with a filter, hidden todos stay put.
// Not a list of unique strings -> 400, an unknown id -> 404.
// Must come before PUT /:id, or "order" would be taken as an id.
todosRouter.put("/order", async (request, response) => {
  const ids: unknown = request.body?.ids;
  if (!isIdList(ids)) {
    response.status(400).json({ error: "ids must be a list of todo ids" });
    return;
  }
  const todos = await TodoModel.find().sort(BY_POSITION);
  const currentOrder = todos.map((todo) => todo._id.toString());
  if (!ids.every((id) => currentOrder.includes(id))) {
    response.status(404).json({ error: "Todo not found" });
    return;
  }
  // Walk the current list: each place held by a moved todo gets the next id of the new order.
  const moved = new Set(ids);
  let next = 0;
  const newOrder = currentOrder.map((id) => (moved.has(id) ? ids[next++] : id));
  // Save every position as 0, 1, 2, … in one call (this also numbers old todos without one).
  if (newOrder.length > 0) {
    await TodoModel.bulkWrite(
      newOrder.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { position: index } } },
      }))
    );
  }
  response.status(204).end();
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
