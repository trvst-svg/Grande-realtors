import pool from "../../config/db.js";

export default async function createInquiry({ user_id, agent_id, property_id, message }) {
  const result = await pool.query(
    `INSERT INTO inquiries (user_id, agent_id, property_id, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, agent_id || null, property_id, message]
  );
  return result.rows[0];
}
