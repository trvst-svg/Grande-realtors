import pool from "../../config/db.js";

export default async function listMessageThreads(userId) {
  const result = await pool.query(
    `SELECT DISTINCT ON (m.property_id, m.other_user_id)
            m.id,
            m.property_id,
            m.body,
            m.created_at,
            u.id AS other_user_id,
            u.firstname,
            u.lastname,
            u.email,
            p.location,
            pt.name AS property_type
     FROM (
       SELECT msg.*,
              CASE
                WHEN msg.sender_id = $1 THEN msg.receiver_id
                ELSE msg.sender_id
              END AS other_user_id
       FROM messages msg
       WHERE msg.sender_id = $1 OR msg.receiver_id = $1
     ) m
     JOIN users u ON u.id = m.other_user_id
     JOIN properties p ON p.id = m.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     ORDER BY m.property_id, m.other_user_id, m.created_at DESC`,
    [userId]
  );
  return result.rows;
}
