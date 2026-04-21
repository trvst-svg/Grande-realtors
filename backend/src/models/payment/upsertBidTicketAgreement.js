import pool from "../../config/db.js";

export default async function upsertBidTicketAgreement({
  auctionId,
  userId,
  agreementText,
}) {
  const result = await pool.query(
    `INSERT INTO bid_ticket_agreements (
        auction_id,
        user_id,
        agreement_text,
        accepted_at
      )
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (auction_id, user_id)
     DO UPDATE SET agreement_text = EXCLUDED.agreement_text,
                   accepted_at = NOW()
     RETURNING *`,
    [auctionId, userId, agreementText]
  );
  return result.rows[0] || null;
}
