import pool from "../database/database.js";

export default async function createLand(req, res) {
  try {
    const {
      seller_id,
      sales_handler_id,
      property_type,
      land_location,
      land_area,
      property_face,
      road_type,
      price,
      road_access,
      land_dimension,
      map_link,
    } = req.body;

    if (
      [
        seller_id,
        sales_handler_id,
        property_type,
        land_location,
        land_area,
        property_face,
        road_type,
        price,
        road_access,
        land_dimension,
        map_link,
      ].some((v) => !v)
    ) {
      return res.json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO lands (seller_id, sales_handler_id, property_type, land_location, land_area, property_face, road_type, price, road_access, land_dimension, map_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        seller_id,
        sales_handler_id,
        property_type,
        land_location,
        land_area,
        property_face,
        road_type,
        price,
        road_access,
        land_dimension,
        map_link,
      ]
    );

    res.json({
      message: "Land posted successfully",
    });
  } catch (error) {
    console.error("Error while posting land:", error);
    res.json({ error: "Server Error" });
  }
}
