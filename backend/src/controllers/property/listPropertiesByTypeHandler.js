import { listPropertiesByType } from "../../models/property.model.js";

export default async function listPropertiesByTypeHandler(req, res, next) {
  try {
    const { type } = req.params;
    const properties = await listPropertiesByType(type);
    res.json({ items: properties });
  } catch (err) {
    next(err);
  }
}
