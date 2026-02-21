import pool from "../../config/db.js";

export default async function getUserById(userId) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  return result.rows[0];
}
