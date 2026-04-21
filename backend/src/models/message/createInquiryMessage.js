import pool from "../../config/db.js";

export default async function createInquiryMessage({
  inquiryId,
  senderId,
  recipientId,
  message,
}) {
  const result = await pool.query(
    `INSERT INTO inquiry_messages (inquiry_id, sender_id, recipient_id, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [inquiryId, senderId, recipientId, message]
  );
  return result.rows[0] || null;
}
