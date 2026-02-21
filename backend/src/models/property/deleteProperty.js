import pool from "../../config/db.js";

export default async function deleteProperty(id) {
  const result = await pool.query(`DELETE FROM properties WHERE id = $1`, [id]);
  return result.rowCount > 0;
}
