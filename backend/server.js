import express from "express";
import { configDotenv } from "dotenv";
import bodyParser from "body-parser";
import routes from "./RouteServices";

const config = configDotenv();

const app = express();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

app.use(bodyParser);
app.use("/grande-realtors/api", routes);
