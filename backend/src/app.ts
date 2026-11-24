import cors from "cors";
import express from "express";

import { errorHandler, notFound } from "./middleware/errors";
import { todosRouter } from "./routes/todos";

export const app = express();

// The React app runs on another origin, so the browser needs CORS headers.
// Locally that is http://localhost:5173, on Render the address of the Static Site (set CORS_ORIGIN).
// Exactly one origin, never "*".
app.use(cors({ origin: process.env.CORS_ORIGIN}));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/todos", todosRouter);

// Always last: the 404 handler, then the error handler.
app.use(notFound);
app.use(errorHandler);
