import type { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found." });
}

// Single place where all server errors become JSON responses.
// Express requires 4 args to treat this as error middleware.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  void _next;
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
}
