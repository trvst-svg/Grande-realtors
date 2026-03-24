import pool from "../../config/db.js";

export default async function listMessagesByThread({
  propertyId,
  userId,
  participantId,
}) {
  const result = await pool.query(
    `SELECT m.*, u.firstname, u.lastname
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.property_id = $1
       AND (
         (m.sender_id = $2 AND m.receiver_id = $3)
         OR (m.sender_id = $3 AND m.receiver_id = $2)
       )
     ORDER BY m.created_at ASC`,
    [propertyId, userId, participantId]
  );
  return result.rows;
}
