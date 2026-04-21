import pool from "../../config/db.js";

export default async function listRatingsByUser(userId, roleType) {
  const result = await pool.query(
    `SELECT r.*,
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
     ORDER BY r.created_at DESC`,
    [userId, roleType]
  );
  return result.rows;
}
