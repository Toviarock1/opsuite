import pino from "pino";

// JSON logs: Render collects stdout, so structured logs beat console.*.
// LOG_LEVEL overrides the default when debugging (e.g. LOG_LEVEL=debug).
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
});
