import {
  getHouseDetailsByPropertyId,
  getLandDetailsByPropertyId,
  getPropertyImages,
  getPropertyWithVerification,
  getSalesHandlerByPropertyId,
} from "../../models/property.model.js";
import {
  getRatingSummaryForUser,
  getSellerAverageRating,
} from "../../models/rating.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function getPropertyHandler(req, res, next) {
  try {
    const property = await getPropertyWithVerification(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const saleStatus = String(property.sale_status || "available").toLowerCase();
    if (saleStatus === "sold") {
      const userId = req.user?.id || null;
      const adminRoleId = await getRoleIdByName("admin");
      const agentRoleId = await getRoleIdByName("agent");
      const canReviewSoldProperty =
        property.owner_id === userId ||
        req.user?.role_id === adminRoleId ||
        req.user?.role_id === agentRoleId;

      if (!canReviewSoldProperty) {
        return res.status(404).json({ error: "Property not found" });
      }
    }

    const images = await getPropertyImages(property.id);
    const salesHandler = await getSalesHandlerByPropertyId(property.id);
    const sellerRating = property.owner_id
      ? await getRatingSummaryForUser(property.owner_id, "seller")
      : null;
    const handlerRating = salesHandler?.id
      ? await getRatingSummaryForUser(salesHandler.id, "handler")
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
      handler_rating: handlerRating,
    });
  } catch (err) {
    next(err);
  }
}
