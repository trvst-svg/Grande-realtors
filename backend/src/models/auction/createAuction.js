import pool from "../../config/db.js";

export default async function createAuction({
  property_id,
  start_time,
  end_time,
  starting_price,
  status,
}) {
  const result = await pool.query(
    `INSERT INTO auctions
      (property_id, start_time, end_time, starting_price, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      property_id,
      start_time || null,
      end_time || null,
      starting_price,
      status || "open",
    ]
  );
  return result.rows[0];
}
