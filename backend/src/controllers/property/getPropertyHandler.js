import {
  getHouseDetailsByPropertyId,
  getLandDetailsByPropertyId,
  getPropertyImages,
  getPropertyWithVerification,
  getSalesHandlerByPropertyId,
} from "../../models/property.model.js";

export default async function getPropertyHandler(req, res, next) {
  try {
    const property = await getPropertyWithVerification(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    const images = await getPropertyImages(property.id);
    const salesHandler = await getSalesHandlerByPropertyId(property.id);

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
    });
  } catch (err) {
    next(err);
  }
}
