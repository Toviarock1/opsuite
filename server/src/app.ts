import cors from "cors";
import express from "express";
import helmet from "helmet";
import healthRouter from "./routes/health.js";
import salesRouter from "./routes/sales.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { writeLimiter } from "./middleware/rateLimit.js";

export function createApp() {
  const app = express();

  // Trust Render's proxy so rate limiting sees the real client IP.
  app.set("trust proxy", 1);

  // Sensible security headers (CSP, no-sniff, no clickjacking) for a JSON API.
  app.use(helmet());

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
  app.use("/api/sales", writeLimiter, salesRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
