import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../../db/seeds/schema.sql");

export default async function ensureDatabaseSchema() {
  // Keep older local databases aligned with the current app shape before any
  // request handlers or background jobs start querying newer tables.
  const schemaSql = await readFile(schemaPath, "utf8");
  await pool.query(schemaSql);
}
