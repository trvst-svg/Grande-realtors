import pool from "../../config/db.js";

export default async function approvePropertyVerificationRequestWithAgent(
  requestId,
  agentId
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE property_verification_requests
       SET request_status = 'approved',
           verified_date = NOW()
       WHERE id = $1 AND request_status = 'pending'
       RETURNING *`,
      [requestId]
    );

    const request = result.rows[0];
    if (!request) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      "DELETE FROM assigned_properties WHERE property_id = $1",
      [request.property_id]
    );

    await client.query(
      `INSERT INTO assigned_properties (agent_id, property_id)
       VALUES ($1, $2)
       ON CONFLICT (agent_id, property_id) DO NOTHING`,
      [agentId, request.property_id]
    );

    await client.query("COMMIT");
    return request;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
