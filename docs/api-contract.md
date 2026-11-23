# API Contract

The backend runs on `http://localhost:3001`. Base path `/api`. Only JSON.

```ts
type Todo = {
  id: string; // the MongoDB ObjectId as a string
  title: string;
  done: boolean;
};
```

A response contains exactly these three fields: no `_id` and no `__v`.

| Method and path         | Body                  | Success                  | Errors                                               |
| ----------------------- | --------------------- | ------------------------ | ---------------------------------------------------- |
| `GET /api/health`       |                       | 200 `{ "status": "ok" }` |                                                      |
| `GET /api/todos`        |                       | 200 `Todo[]`             | 400 `{ "error": "<message>" }`                       |
| `POST /api/todos`       | `{ "title": "..." }`  | 201 `Todo`               | 400 `{ "error": "<message>" }`                       |
| `PUT /api/todos/order`  | `{ "ids": [...] }`    | 204, no body             | 400 `{ "error": "<message>" }`, 404 `Todo not found` |
| `PUT /api/todos/:id`    | `{ "title", "done" }` | 200 `Todo`               | 400 `{ "error": "<message>" }`, 404 `Todo not found` |
| `DELETE /api/todos/:id` |                       | 204, no body             | 404 `{ "error": "Todo not found" }`                  |
| any other route         |                       |                          | 404 `{ "error": "Not found" }`                       |

- `GET /api/todos` takes the optional query parameter `done`: `?done=true` returns only the done todos, `?done=false` only the open ones. Without `done`, all todos are returned. Any other value gives 400 `{ "error": "done must be true or false" }`.
- `GET /api/todos` returns the todos in the order the user gave them (see `PUT /api/todos/order`).
- `POST` creates a todo with `done: false` at the end of the list. The title is trimmed. A missing or empty title gives 400.
- `PUT /api/todos/order` saves a new order. `ids` lists todo ids in their new order. Only these todos move, among the places they hold now: todos that are not listed (for example hidden by a filter) keep their places. `ids` that is not a list of strings, or that has an id twice, gives 400 `{ "error": "ids must be a list of todo ids" }`. An id that does not exist gives 404 `{ "error": "Todo not found" }`.
- `PUT` replaces `title` and `done`. Always send both, also when you only change one of them.
- A body that is not valid JSON gives 400. An `id` that is not a valid ObjectId gives 404.
- All errors look like `{ "error": "<message>" }`. An unexpected error gives 500 `{ "error": "Internal server error" }` without details.

## Examples

```http
GET /api/todos?done=true

200
[{ "id": "6aff79b9cd3147d2599d2f45", "title": "Buy oat milk", "done": true }]
```

```http
GET /api/todos?done=yes

400
{ "error": "done must be true or false" }
```

```http
POST /api/todos
{ "title": "Buy milk" }

201
{ "id": "6aff79b9cd3147d2599d2f45", "title": "Buy milk", "done": false }
```

```http
PUT /api/todos/6aff79b9cd3147d2599d2f45
{ "title": "Buy oat milk", "done": true }

200
{ "id": "6aff79b9cd3147d2599d2f45", "title": "Buy oat milk", "done": true }
```

```http
PUT /api/todos/order
{ "ids": ["6aff79b9cd3147d2599d2f46", "6aff79b9cd3147d2599d2f45"] }

204
```

```http
POST /api/todos
{ "title": "" }

400
{ "error": "A todo needs a title, and done must be true or false" }
```
