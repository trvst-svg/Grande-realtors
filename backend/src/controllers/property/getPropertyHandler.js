import {
  getHouseDetailsByPropertyId,
  getLandDetailsByPropertyId,
  getPropertyImages,
  getPropertyWithVerification,
  getSalesHandlerByPropertyId,
} from "../../models/property.model.js";
import { getSellerAverageRating } from "../../models/rating.model.js";

export default async function getPropertyHandler(req, res, next) {
  try {
    const property = await getPropertyWithVerification(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    const images = await getPropertyImages(property.id);
    const salesHandler = await getSalesHandlerByPropertyId(property.id);
    const sellerRating = property.owner_id
      ? await getSellerAverageRating(property.owner_id)
      : null;

    let details = null;
    if (property.property_type === "house") {
      details = await getHouseDetailsByPropertyId(property.id);
    } else if (property.property_type === "land") {
      details = await getLandDetailsByPropertyId(property.id);
    }

    res.json({
      ...property,
      images,
      details,
      sales_handler: salesHandler,
      seller_rating: sellerRating,
    });
  } catch (err) {
    next(err);
  }
}
