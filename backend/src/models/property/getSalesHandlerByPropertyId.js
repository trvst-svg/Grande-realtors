import pool from "../../config/db.js";

export default async function getSalesHandlerByPropertyId(propertyId) {
  const result = await pool.query(
    `SELECT u.id, u.firstname, u.lastname, u.email, u.number, ap.assigned_at
     FROM assigned_properties ap
     JOIN users u ON u.id = ap.agent_id
     WHERE ap.property_id = $1
     ORDER BY ap.assigned_at DESC
     LIMIT 1`,
    [propertyId]
  );
  return result.rows[0] || null;
}
