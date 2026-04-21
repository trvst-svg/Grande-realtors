import pool from "../../config/db.js";

export default async function listInquiriesByProperty(propertyId) {
  const result = await pool.query(
    `SELECT i.id,
            i.property_id,
            i.user_id,
            i.agent_id,
            i.message,
            i.created_at,
            u.firstname,
            u.lastname,
            u.email,
            u.number
     FROM inquiries i
     JOIN users u ON u.id = i.user_id
     WHERE i.property_id = $1
     ORDER BY i.created_at DESC`,
    [propertyId]
  );
  return result.rows;
}
