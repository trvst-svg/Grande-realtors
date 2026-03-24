import pool from "../../config/db.js";

export default async function createMessage({
  property_id,
  sender_id,
  receiver_id,
  body,
}) {
  const result = await pool.query(
    `INSERT INTO messages (property_id, sender_id, receiver_id, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [property_id, sender_id, receiver_id, body]
  );
  return result.rows[0];
}
