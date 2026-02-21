import { searchProperties } from "../../models/property.model.js";

export default async function searchPropertiesHandler(req, res, next) {
  try {
    const { type, location, min_price, max_price, status } = req.query;
    const items = await searchProperties({
      type,
      location,
      min_price,
      max_price,
      status,
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
