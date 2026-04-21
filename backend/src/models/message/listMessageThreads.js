import pool from "../../config/db.js";

export default async function listMessageThreads({ userId, isAdmin = false }) {
  const result = await pool.query(
    `SELECT i.id AS inquiry_id,
            i.created_at AS inquiry_created_at,
            i.message AS inquiry_message,
            p.id AS property_id,
            p.location,
            pt.name AS property_type,
            u.id AS user_id,
            u.firstname AS user_firstname,
            u.lastname AS user_lastname,
            a.id AS agent_id,
            a.firstname AS agent_firstname,
            a.lastname AS agent_lastname,
            COALESCE(last_msg.message, i.message) AS latest_message,
            COALESCE(last_msg.created_at, i.created_at) AS latest_created_at,
            last_msg.sender_id AS latest_sender_id
     FROM inquiries i
     JOIN properties p ON p.id = i.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users u ON u.id = i.user_id
     LEFT JOIN users a ON a.id = i.agent_id
     LEFT JOIN LATERAL (
       SELECT im.message, im.created_at, im.sender_id
       FROM inquiry_messages im
       WHERE im.inquiry_id = i.id
       ORDER BY im.created_at DESC
       LIMIT 1
     ) last_msg ON TRUE
     WHERE ($2::boolean = TRUE OR i.user_id = $1 OR i.agent_id = $1)
     ORDER BY COALESCE(last_msg.created_at, i.created_at) DESC`,
    [userId, isAdmin]
  );
  return result.rows;
}
