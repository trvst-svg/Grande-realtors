import pool from "../../config/db.js";

export default async function addPropertyImages(property_id, imageUrls = []) {
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
