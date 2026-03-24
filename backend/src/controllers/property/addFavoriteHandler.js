import {
  findSimilarProperties,
  getHouseDetailsByPropertyId,
  getLandDetailsByPropertyId,
  getPropertyById,
} from "../../models/property.model.js";
import { getUserById } from "../../models/user.model.js";
import { addFavorite } from "../../models/favorite.model.js";
import { sendSimilarListingsEmail } from "../../utils/mailer.js";

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

    try {
      const user = await getUserById(userId);
      if (user?.email) {
        let details = null;
        if (property.property_type === "land") {
          details = await getLandDetailsByPropertyId(property.id);
        } else if (property.property_type === "house") {
          details = await getHouseDetailsByPropertyId(property.id);
        }

        const listings = await findSimilarProperties({
          property,
          details,
          limit: 5,
        });

        if (listings.length) {
          await sendSimilarListingsEmail({
            to: user.email,
            name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
            property,
            listings,
            frontendBase: process.env.FRONTEND_URL || "http://localhost:5173",
          });
        }
      }
    } catch (err) {
      if (err.code !== "MAIL_NOT_CONFIGURED") {
        console.error("Failed to send similar listings email", err);
      }
    }
    return res.json({ message: "Property bookmarked", isBookmarked: true });
  } catch (err) {
    return next(err);
  }
}
