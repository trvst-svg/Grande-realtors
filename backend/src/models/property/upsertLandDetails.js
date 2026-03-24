import pool from "../../config/db.js";

export default async function upsertLandDetails({
  property_id,
  area,
  dimensions,
  road_type,
  road_access,
  property_face,
  map_link,
}) {
  const updateResult = await pool.query(
    `UPDATE lands
     SET area = $2,
         dimensions = $3,
         road_type = $4,
         road_access = $5,
         property_face = $6,
         map_link = $7
     WHERE property_id = $1`,
    [property_id, area, dimensions, road_type, road_access, property_face, map_link]
  );

  if (updateResult.rowCount) return;

  await pool.query(
    `INSERT INTO lands
      (property_id, area, dimensions, road_type, road_access, property_face, map_link)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [property_id, area, dimensions, road_type, road_access, property_face, map_link]
  );
}
