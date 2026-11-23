import { model, Schema, type HydratedDocument, type InferSchemaType } from "mongoose";

import type { Todo } from "../types";

const todoSchema = new Schema({
  title: { type: String, required: true, trim: true },
  // `required`: a PUT has to send `done`. POST still works without it, the default comes first.
  done: { type: Boolean, required: true, default: false },
  // The place in the list (0 = top). Internal only: the API does not send it.
  // Todos created before this field existed have none: they sort first, by creation.
  position: { type: Number },
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
