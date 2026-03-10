import { getPropertyById } from "../../models/property.model.js";
import { removeFavorite } from "../../models/favorite.model.js";

export default async function removeFavoriteHandler(req, res, next) {
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

    await removeFavorite(userId, propertyId);
    return res.json({ message: "Bookmark removed", isBookmarked: false });
  } catch (err) {
    return next(err);
  }
}
