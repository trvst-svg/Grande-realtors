import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on("connect", () => {

});


pool.on("error", (err) => {
  // Pool-level failures usually leave the API in a degraded state, so fail fast.
  console.error("Unexpected database error:", err);
  process.exit(-1);
});

export default pool;
