import pool from "../../config/db.js";

export default async function updateProperty(id, fields) {
  const keys = Object.keys(fields).filter((key) => fields[key] !== undefined);
  if (!keys.length) return null;

  const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  const values = keys.map((key) => fields[key]);
  values.push(id);

  const result = await pool.query(
    `UPDATE properties SET ${setClause}, updated_at = NOW() WHERE id = $$${
      keys.length + 1
    } RETURNING *`,
    values
  );
  return result.rows[0];
}
