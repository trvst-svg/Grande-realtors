import pool from "../../config/db.js";

export default async function getRoleIdByName(name) {
  const result = await pool.query("SELECT id FROM roles WHERE name = $1", [
    name,
  ]);
  return result.rows[0]?.id || null;
}
