import { configDotenv } from "dotenv";
import app from "./app.js";
import startAuctionStartNotifier from "./jobs/auctionStartNotifier.js";

configDotenv();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
  startAuctionStartNotifier();
});
