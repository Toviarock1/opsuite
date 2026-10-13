import "dotenv/config";
import { createApp } from "./app.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";

const rawPort = Number(process.env.PORT);
const port = Number.isInteger(rawPort) && rawPort > 0 ? rawPort : 4000;
const app = createApp();

// Default export lets Vercel detect the Express app;
// app.listen keeps `npm start` working on Render/any host.
export default app;

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

// Let in-flight requests finish, then disconnect Prisma and exit.
// The force timeout covers hanging keep-alive connections on redeploy.
let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutting down");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
