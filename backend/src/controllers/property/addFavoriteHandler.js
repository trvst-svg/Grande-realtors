import { getPropertyById } from "../../models/property.model.js";
import { addFavorite } from "../../models/favorite.model.js";

export default async function addFavoriteHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    const propertyId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!propertyId) {
      return res.status(400).json({ error: "Property id is required" });
    }

    const property = await getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    await addFavorite(userId, propertyId);
    return res.json({ message: "Property bookmarked", isBookmarked: true });
  } catch (err) {
    return next(err);
  }
}
