import pool from "../../config/db.js";

export default async function createLandDetails({
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
    [
      property_id,
      area,
      dimensions,
      road_type,
      road_access,
      property_face,
      map_link,
    ]
  );
}
