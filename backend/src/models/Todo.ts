import { model, Schema, type HydratedDocument, type InferSchemaType } from "mongoose";

import type { Todo } from "../types";

const todoSchema = new Schema({
  title: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
});

type TodoDocument = HydratedDocument<InferSchemaType<typeof todoSchema>>;

export const TodoModel = model("Todo", todoSchema);

/** Turns a database document into what the API sends: `id` instead of `_id`, no `__v`. */
export function toTodo(document: TodoDocument): Todo {
  return {
    id: document._id.toString(),
    title: document.title,
    done: document.done,
  };
}
