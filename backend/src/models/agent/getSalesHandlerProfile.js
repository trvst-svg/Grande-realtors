import pool from "../../config/db.js";

export default async function getSalesHandlerProfile(agentId) {
  const handlerResult = await pool.query(
    `SELECT u.id,
            u.firstname,
            u.lastname,
            u.email,
            u.number,
            COALESCE(rating.avg_rating, 0)::numeric(4,2) AS avg_rating,
            COALESCE(rating.review_count, 0)::int AS review_count
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN (
       SELECT rated_user_id,
              AVG(stars) AS avg_rating,
              COUNT(*)::int AS review_count
       FROM ratings
       WHERE role_type = 'handler'
         AND is_hidden = FALSE
       GROUP BY rated_user_id
     ) rating ON rating.rated_user_id = u.id
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

  const feedbackResult = await pool.query(
    `SELECT r.id,
            r.stars,
            r.review,
            r.created_at,
            buyer.firstname AS buyer_firstname,
            buyer.lastname AS buyer_lastname,
            p.location
     FROM ratings r
     JOIN users buyer ON buyer.id = r.buyer_id
     JOIN properties p ON p.id = r.property_id
     WHERE r.rated_user_id = $1
       AND r.role_type = 'handler'
       AND r.is_hidden = FALSE
     ORDER BY r.created_at DESC
     LIMIT 5`,
    [agentId]
  );

  return {
    handler,
    properties: assignedResult.rows,
    feedback: feedbackResult.rows,
  };
}
