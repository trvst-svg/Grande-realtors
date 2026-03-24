import pool from "../../config/db.js";

function buildBaseQuery({ type, whereClauses }) {
  return `
    SELECT p.id,
           p.location,
           p.price,
           p.listing_type,
           pt.name AS property_type,
           img.image_url AS image,
           l.area AS land_area,
           l.dimensions AS land_dimensions,
           l.road_type AS land_road_type,
           l.road_access AS land_road_access,
           l.property_face AS land_property_face,
           h.area AS house_area,
           h.number_of_floors AS house_floors,
           h.number_of_bedrooms AS house_bedrooms
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
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY p.listed_date DESC
    LIMIT $${whereClauses.length + 1}
  `;
}

export default async function findSimilarProperties({
  property,
  details,
  limit = 5,
}) {
  if (!property?.id || !property?.property_type) return [];

  const whereClauses = ["p.id <> $1", "pt.name = $2", "p.sale_status = 'available'"];
  const values = [property.id, property.property_type];

  if (property.listing_type) {
    values.push(property.listing_type);
    whereClauses.push(`LOWER(p.listing_type) = LOWER($${values.length})`);
  }

  if (property.property_type === "land") {
    if (details?.road_type) {
      values.push(details.road_type);
      whereClauses.push(`LOWER(l.road_type) = LOWER($${values.length})`);
    }
    if (details?.property_face) {
      values.push(details.property_face);
      whereClauses.push(`LOWER(l.property_face) = LOWER($${values.length})`);
    }
    if (details?.area) {
      const area = Number(details.area);
      if (Number.isFinite(area)) {
        const min = area * 0.8;
        const max = area * 1.2;
        values.push(min, max);
        whereClauses.push(
          `l.area BETWEEN $${values.length - 1} AND $${values.length}`
        );
      }
    }
  } else if (property.property_type === "house") {
    if (details?.number_of_bedrooms !== undefined && details?.number_of_bedrooms !== null) {
      const bedrooms = Number(details.number_of_bedrooms);
      if (Number.isFinite(bedrooms)) {
        values.push(bedrooms - 1, bedrooms + 1);
        whereClauses.push(
          `h.number_of_bedrooms BETWEEN $${values.length - 1} AND $${values.length}`
        );
      }
    }
    if (details?.area) {
      const area = Number(details.area);
      if (Number.isFinite(area)) {
        const min = area * 0.8;
        const max = area * 1.2;
        values.push(min, max);
        whereClauses.push(
          `h.area BETWEEN $${values.length - 1} AND $${values.length}`
        );
      }
    }
  }

  whereClauses.push("(pvr.request_status IS NULL OR pvr.request_status = 'approved')");

  values.push(limit);
  const query = buildBaseQuery({ type: property.property_type, whereClauses });
  const result = await pool.query(query, values);
  return result.rows;
}
