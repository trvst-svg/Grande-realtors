import pool from "../../config/db.js";

export default async function findUserByNumber(number) {
  const result = await pool.query("SELECT * FROM users WHERE number = $1", [
    number,
  ]);
  return result.rows[0];
}
