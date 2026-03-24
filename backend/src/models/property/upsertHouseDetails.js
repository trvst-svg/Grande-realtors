import pool from "../../config/db.js";

export default async function upsertHouseDetails({
  property_id,
  area,
  number_of_floors,
  number_of_bedrooms,
}) {
  const updateResult = await pool.query(
    `UPDATE houses
     SET area = $2,
         number_of_floors = $3,
         number_of_bedrooms = $4
     WHERE property_id = $1`,
    [property_id, area, number_of_floors, number_of_bedrooms]
  );

  if (updateResult.rowCount) return;

  await pool.query(
    `INSERT INTO houses
      (property_id, area, number_of_floors, number_of_bedrooms)
     VALUES ($1, $2, $3, $4)`,
    [property_id, area, number_of_floors, number_of_bedrooms]
  );
}
