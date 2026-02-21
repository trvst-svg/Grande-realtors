import pool from "../../config/db.js";

export default async function listProperties() {
  const result = await pool.query(
    `SELECT p.*, pt.name AS property_type, img.image_url AS image
     FROM properties p
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
     WHERE pvr.request_status IS NULL OR pvr.request_status = 'approved'
     ORDER BY p.listed_date DESC`
  );
  return result.rows;
}
