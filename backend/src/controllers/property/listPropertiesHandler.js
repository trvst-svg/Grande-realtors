import { listProperties } from "../../models/property.model.js";

export default async function listPropertiesHandler(_req, res, next) {
  try {
    const properties = await listProperties();
    res.json({ items: properties });
  } catch (err) {
    next(err);
  }
}
