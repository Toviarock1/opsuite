import { rateLimit } from "express-rate-limit";

const WRITE_WINDOW_MS = 15 * 60 * 1000;
const WRITE_MAX_REQUESTS = 100;

// Reads and single-sale lookups stay unlimited; only writes count.
// 100 writes per 15 minutes per IP is far above shop usage
// but stops scripts from spamming POST /api/sales all day.
export const writeLimiter = rateLimit({
  windowMs: WRITE_WINDOW_MS,
  limit: WRITE_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET",
  handler: (_req, res) => {
    res
      .status(429)
      .json({ error: "Too many requests. Slow down and try again." });
  },
});
