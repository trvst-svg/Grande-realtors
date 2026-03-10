import pool from "../../config/db.js";

export default async function getSalesHandlerProfile(agentId) {
  const handlerResult = await pool.query(
    `SELECT u.id,
            u.firstname,
            u.lastname,
            u.email,
            u.number,
            COALESCE(rating.avg_rating, 0)::numeric(4,2) AS avg_rating
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN (
       SELECT agent_id, AVG(rating) AS avg_rating
       FROM sales_handler_rating
       GROUP BY agent_id
     ) rating ON rating.agent_id = u.id
     WHERE r.name = 'agent'
       AND u.approval_status = 'approved'
       AND u.id = $1`,
    [agentId]
  );

  const handler = handlerResult.rows[0] || null;
  if (!handler) return null;

  const assignedResult = await pool.query(
    `SELECT ap.id,
            ap.assigned_at,
            p.id AS property_id,
            p.location,
            p.price,
            p.description,
            pt.name AS property_type,
            img.image_url AS image
     FROM assigned_properties ap
     JOIN properties p ON p.id = ap.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     LEFT JOIN LATERAL (
       SELECT image_url
       FROM property_images
       WHERE property_id = p.id
       ORDER BY id ASC
       LIMIT 1
     ) img ON true
     LEFT JOIN LATERAL (
       SELECT request_status
       FROM property_verification_requests
       WHERE property_id = p.id
       ORDER BY id DESC
       LIMIT 1
     ) pvr ON true
     WHERE ap.agent_id = $1
       AND (pvr.request_status IS NULL OR pvr.request_status = 'approved')
     ORDER BY ap.assigned_at DESC`,
    [agentId]
  );

  return {
    handler,
    properties: assignedResult.rows,
  };
}
