import pool from "../../config/db.js";

export default async function getAgentDashboardStats(agentId) {
  const assigned = await pool.query(
    `SELECT COUNT(*)::int AS count FROM assigned_properties WHERE agent_id = $1`,
    [agentId]
  );
  const inquiries = await pool.query(
    `SELECT COUNT(*)::int AS count FROM inquiries WHERE agent_id = $1`,
    [agentId]
  );
  const ratings = await pool.query(
    `SELECT COALESCE(AVG(stars), 0)::numeric(4,2) AS avg_rating,
            COUNT(*)::int AS review_count
     FROM ratings
     WHERE rated_user_id = $1
       AND role_type = 'handler'
       AND is_hidden = FALSE`,
    [agentId]
  );
  const recentFeedback = await pool.query(
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

  const assignedList = await pool.query(
    `SELECT p.id,
            p.location,
            p.price,
            p.listing_type,
            p.listing_purpose,
            p.sale_status,
            pt.name AS property_type,
            ap.assigned_at,
            image.image_url AS image
     FROM assigned_properties ap
     JOIN properties p ON p.id = ap.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     LEFT JOIN LATERAL (
       SELECT image_url
       FROM property_images
       WHERE property_id = p.id
       ORDER BY id ASC
       LIMIT 1
     ) image ON TRUE
     WHERE ap.agent_id = $1
     ORDER BY ap.assigned_at DESC
     LIMIT 6`,
    [agentId]
  );

  const recentInquiries = await pool.query(
    `SELECT i.id,
            i.message,
            i.created_at,
            p.id AS property_id,
            p.location,
            p.price,
            pt.name AS property_type,
            u.id AS user_id,
            u.firstname,
            u.lastname,
            u.email,
            u.number
     FROM inquiries i
     JOIN properties p ON p.id = i.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users u ON u.id = i.user_id
     WHERE i.agent_id = $1
     ORDER BY i.created_at DESC
     LIMIT 8`,
    [agentId]
  );

  return {
    stats: {
      assigned: assigned.rows[0].count,
      inquiries: inquiries.rows[0].count,
      rating: ratings.rows[0].avg_rating,
      reviewCount: ratings.rows[0].review_count,
    },
    assignedProperties: assignedList.rows,
    recentInquiries: recentInquiries.rows,
    recentFeedback: recentFeedback.rows,
  };
}
