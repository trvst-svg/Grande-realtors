import pool from "../../config/db.js";

export default async function getInquiryThread(inquiryId) {
  const inquiryResult = await pool.query(
    `SELECT i.id AS inquiry_id,
            i.user_id,
            i.agent_id,
            i.property_id,
            i.message AS inquiry_message,
            i.created_at AS inquiry_created_at,
            p.location,
            pt.name AS property_type,
            u.firstname AS user_firstname,
            u.lastname AS user_lastname,
            u.email AS user_email,
            a.firstname AS agent_firstname,
            a.lastname AS agent_lastname,
            a.email AS agent_email
     FROM inquiries i
     JOIN properties p ON p.id = i.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users u ON u.id = i.user_id
     LEFT JOIN users a ON a.id = i.agent_id
     WHERE i.id = $1`,
    [inquiryId]
  );

  const inquiry = inquiryResult.rows[0] || null;
  if (!inquiry) return null;

  const messagesResult = await pool.query(
    `SELECT im.id,
            im.inquiry_id,
            im.sender_id,
            im.recipient_id,
            im.message,
            im.created_at,
            sender.firstname AS sender_firstname,
            sender.lastname AS sender_lastname
     FROM inquiry_messages im
     JOIN users sender ON sender.id = im.sender_id
     WHERE im.inquiry_id = $1
     ORDER BY im.created_at ASC`,
    [inquiryId]
  );

  return {
    inquiry,
    messages: messagesResult.rows,
  };
}
