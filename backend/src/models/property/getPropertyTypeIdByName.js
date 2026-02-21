import pool from "../../config/db.js";

export default async function getPropertyTypeIdByName(name) {
  const result = await pool.query(
    "SELECT id FROM property_types WHERE name = $1",
    [name]
  );
  return result.rows[0]?.id || null;
}
