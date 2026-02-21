import pool from "../../config/db.js";

export default async function getRoleNameById(id) {
  if (!id) return null;
  const result = await pool.query("SELECT name FROM roles WHERE id = $1", [id]);
  return result.rows[0]?.name || null;
}
