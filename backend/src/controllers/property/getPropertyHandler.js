import { getPropertyImages, getPropertyWithVerification } from "../../models/property.model.js";

export default async function getPropertyHandler(req, res, next) {
  try {
    const property = await getPropertyWithVerification(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    const images = await getPropertyImages(property.id);
    res.json({ ...property, images });
  } catch (err) {
    next(err);
  }
}
