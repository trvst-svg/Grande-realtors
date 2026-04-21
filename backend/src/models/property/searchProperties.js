import pool from "../../config/db.js";

export default async function searchProperties({
  type,
  location,
  query,
  min_price,
  max_price,
  min_area,
  max_area,
  status,
}) {
  const conditions = [];
  const values = [];

  if (type) {
    values.push(type);
    conditions.push(`pt.name = $${values.length}`);
  }
  if (location) {
    values.push(`%${location}%`);
    conditions.push(`p.location ILIKE $${values.length}`);
  }
  if (query) {
    values.push(`%${query}%`);
    conditions.push(
      `(p.location ILIKE $${values.length} OR p.description ILIKE $${values.length})`
    );
  }
  if (min_price) {
    values.push(min_price);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (max_price) {
    values.push(max_price);
    conditions.push(`p.price <= $${values.length}`);
  }
  if (min_area) {
    values.push(min_area);
    conditions.push(`COALESCE(l.area, h.area) >= $${values.length}`);
  }
  if (max_area) {
    values.push(max_area);
    conditions.push(`COALESCE(l.area, h.area) <= $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`p.sale_status = $${values.length}`);
  } else {
    // Public search should only surface currently available inventory.
    conditions.push(`COALESCE(p.sale_status, 'available') = 'available'`);
  }

  conditions.push(
    `(pvr.request_status IS NULL OR pvr.request_status = 'approved')`
  );

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT p.*, pt.name AS property_type, img.image_url AS image,
            COALESCE(l.area, h.area) AS area
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     LEFT JOIN lands l ON l.property_id = p.id
     LEFT JOIN houses h ON h.property_id = p.id
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
     ${whereClause}
     ORDER BY p.listed_date DESC`,
    values
  );
  return result.rows;
}
