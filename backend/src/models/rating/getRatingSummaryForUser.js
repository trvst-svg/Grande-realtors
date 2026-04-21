import pool from "../../config/db.js";

export default async function getRatingSummaryForUser(userId, roleType) {
  const summaryResult = await pool.query(
    `SELECT COALESCE(AVG(stars), 0)::numeric(4,2) AS avg_rating,
            COUNT(*)::int AS review_count
     FROM ratings
     WHERE rated_user_id = $1
       AND role_type = $2
       AND is_hidden = FALSE`,
    [userId, roleType]
  );

  const recentResult = await pool.query(
    `SELECT r.id,
            r.stars,
            r.review,
            r.created_at,
            buyer.firstname AS buyer_firstname,
            buyer.lastname AS buyer_lastname,
            p.location,
            pt.name AS property_type
     FROM ratings r
     JOIN users buyer ON buyer.id = r.buyer_id
     JOIN properties p ON p.id = r.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE r.rated_user_id = $1
       AND r.role_type = $2
       AND r.is_hidden = FALSE
     ORDER BY r.created_at DESC
     LIMIT 5`,
    [userId, roleType]
  );

  return {
    avg_rating: summaryResult.rows[0]?.avg_rating || 0,
    review_count: summaryResult.rows[0]?.review_count || 0,
    recent_feedback: recentResult.rows,
  };
}
