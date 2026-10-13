import cors from "cors";
import express from "express";
import healthRouter from "./routes/health.js";
import salesRouter from "./routes/sales.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  // Only the deployed frontend (plus localhost in dev) may call the API.
  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    }),
  );

  app.use("/health", healthRouter);
  app.use("/api/sales", salesRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
