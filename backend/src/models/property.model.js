import pool from "../config/db.js";

export async function getPropertyTypeIdByName(name) {
  const result = await pool.query(
    "SELECT id FROM property_types WHERE name = $1",
    [name]
  );
  return result.rows[0]?.id || null;
}

export async function createProperty({
  owner_id,
  property_type_id,
  location,
  description,
  price,
  sale_status,
}) {
  const result = await pool.query(
    `INSERT INTO properties
      (owner_id, property_type_id, location, description, price, sale_status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [owner_id, property_type_id, location, description, price, sale_status]
  );
  return result.rows[0];
}

export async function createLandDetails({
  property_id,
  area,
  dimensions,
  road_type,
  road_access,
  property_face,
  map_link,
}) {
  await pool.query(
    `INSERT INTO lands
      (property_id, area, dimensions, road_type, road_access, property_face, map_link)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [property_id, area, dimensions, road_type, road_access, property_face, map_link]
  );
}

export async function createHouseDetails({
  property_id,
  area,
  number_of_floors,
  number_of_bedrooms,
}) {
  await pool.query(
    `INSERT INTO houses
      (property_id, area, number_of_floors, number_of_bedrooms)
     VALUES ($1, $2, $3, $4)`,
    [property_id, area, number_of_floors, number_of_bedrooms]
  );
}

export async function addPropertyImages(property_id, imageUrls = []) {
  if (!imageUrls.length) return;
  const values = imageUrls.map((url) => [property_id, url]);
  const placeholders = values
    .map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`)
    .join(", ");
  const flat = values.flat();
  await pool.query(
    `INSERT INTO property_images (property_id, image_url) VALUES ${placeholders}`,
    flat
  );
}

export async function listProperties() {
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

export async function listPropertiesByType(typeName) {
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
     WHERE pt.name = $1
       AND (pvr.request_status IS NULL OR pvr.request_status = 'approved')
     ORDER BY p.listed_date DESC`,
    [typeName]
  );
  return result.rows;
}

export async function searchProperties({
  type,
  location,
  min_price,
  max_price,
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
  if (min_price) {
    values.push(min_price);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (max_price) {
    values.push(max_price);
    conditions.push(`p.price <= $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`p.sale_status = $${values.length}`);
  }

  conditions.push(`(pvr.request_status IS NULL OR pvr.request_status = 'approved')`);

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

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
     ${whereClause}
     ORDER BY p.listed_date DESC`,
    values
  );
  return result.rows;
}

export async function createPropertyVerificationRequest(propertyId) {
  const result = await pool.query(
    `INSERT INTO property_verification_requests (property_id, request_status)
     SELECT $1, 'pending'
     WHERE NOT EXISTS (
       SELECT 1 FROM property_verification_requests WHERE property_id = $1
     )
     RETURNING *`,
    [propertyId]
  );
  return result.rows[0] || null;
}

export async function listPendingPropertyVerificationRequests() {
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

export async function approvePropertyVerificationRequest(requestId) {
  const result = await pool.query(
    `UPDATE property_verification_requests
     SET request_status = 'approved',
         verified_date = NOW()
     WHERE id = $1 AND request_status = 'pending'
     RETURNING *`,
    [requestId]
  );
  return result.rows[0];
}

export async function rejectPropertyVerificationRequest(requestId) {
  const result = await pool.query(
    `UPDATE property_verification_requests
     SET request_status = 'rejected',
         verified_date = NOW()
     WHERE id = $1 AND request_status = 'pending'
     RETURNING *`,
    [requestId]
  );
  return result.rows[0];
}

export async function getPropertyById(id) {
  const result = await pool.query(
    `SELECT p.*, pt.name AS property_type
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function getPropertyImages(property_id) {
  const result = await pool.query(
    `SELECT image_url FROM property_images WHERE property_id = $1`,
    [property_id]
  );
  return result.rows.map((row) => row.image_url);
}

export async function updateProperty(id, fields) {
  const keys = Object.keys(fields).filter((key) => fields[key] !== undefined);
  if (!keys.length) return null;

  const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  const values = keys.map((key) => fields[key]);
  values.push(id);

  const result = await pool.query(
    `UPDATE properties SET ${setClause}, updated_at = NOW() WHERE id = $${
      keys.length + 1
    } RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteProperty(id) {
  const result = await pool.query(`DELETE FROM properties WHERE id = $1`, [id]);
  return result.rowCount > 0;
}
