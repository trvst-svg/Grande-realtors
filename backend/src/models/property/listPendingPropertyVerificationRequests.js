import pool from "../../config/db.js";

export default async function listPendingPropertyVerificationRequests() {
  const result = await pool.query(
    `SELECT pvr.id,
            pvr.property_id,
            pvr.request_status,
            pvr.verified_date,
            p.location,
            p.price,
            p.listed_date,
            pt.name AS property_type,
            u.id AS owner_id,
            u.firstname,
            u.lastname,
            u.email,
            img.image_url AS image
     FROM property_verification_requests pvr
     JOIN properties p ON p.id = pvr.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users u ON u.id = p.owner_id
     LEFT JOIN LATERAL (
       SELECT image_url
       FROM property_images
       WHERE property_id = p.id
       ORDER BY id ASC
       LIMIT 1
     ) img ON true
     WHERE pvr.request_status = 'pending'
     ORDER BY pvr.id ASC`
  );
  return result.rows;
}
