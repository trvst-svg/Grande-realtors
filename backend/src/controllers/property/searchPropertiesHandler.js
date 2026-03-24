import { searchProperties } from "../../models/property.model.js";

export default async function searchPropertiesHandler(req, res, next) {
  try {
    const {
      type,
      location,
      query,
      min_price,
      max_price,
      min_area,
      max_area,
      status,
    } = req.query;
    const items = await searchProperties({
      type,
      location,
      query,
      min_price,
      max_price,
      min_area,
      max_area,
      status,
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
