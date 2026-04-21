import { configDotenv } from "dotenv";
import app from "./app.js";
import ensureDatabaseSchema from "./jobs/ensureDatabaseSchema.js";
import startAuctionStartNotifier from "./jobs/auctionStartNotifier.js";

configDotenv();

const port = process.env.PORT || 5000;

async function startServer() {
  await ensureDatabaseSchema();

  app.listen(port, () => {
    // Start background auction polling only after the HTTP server is ready.
    startAuctionStartNotifier();
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
