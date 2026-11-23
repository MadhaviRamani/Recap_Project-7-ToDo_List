import { Router } from "express";

import { TodoModel, toTodo } from "../models/Todo";

export const todosRouter = Router();

// The router is mounted on /api/todos in app.ts. The contract is in docs/api-contract.md.

// GET /api/todos -> 200 with the list of todos
todosRouter.get("/", async (_request, response) => {
  const todos = await TodoModel.find();
  response.json(todos.map(toTodo));
});
