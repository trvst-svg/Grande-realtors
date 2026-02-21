import pool from "../../config/db.js";

export default async function createHouseDetails({
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
