import "dotenv/config";
import { createApp } from "./app.js";

const rawPort = Number(process.env.PORT);
const port = Number.isInteger(rawPort) && rawPort > 0 ? rawPort : 4000;
const app = createApp();

// Default export lets Vercel detect the Express app;
// app.listen keeps `npm start` working on Render/any host.
export default app;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
