import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

// Default export lets Vercel detect the Express app;
// app.listen keeps `npm start` working on Render/any host.
export default app;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
