import {
  addPropertyImages,
  createHouseDetails,
  createLandDetails,
  createProperty,
  createPropertyVerificationRequest,
  getPropertyTypeIdByName,
} from "../../models/property.model.js";

export default async function createPropertyHandler(req, res, next) {
  try {
    const {
      property_type,
      property_type_id,
      location,
      description,
      price,
      sale_status,
      listing_type,
      images,
      land,
      house,
    } = req.body;

    const owner_id = req.user?.id;

    if (!owner_id) {
      return res.status(401).json({ error: "Authorization required" });
    }

    if (!location || !price || (!property_type && !property_type_id)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allowedTypes = ["land", "house"];
    if (property_type && !allowedTypes.includes(property_type)) {
      return res.status(400).json({ error: "Invalid property type" });
    }

    const allowedListingTypes = [
      "residential",
      "commercial",
      "semi-commercial",
    ];
    if (listing_type && !allowedListingTypes.includes(listing_type)) {
      return res.status(400).json({ error: "Invalid listing type" });
    }

    if (Number.isNaN(Number(price))) {
      return res.status(400).json({ error: "Price must be a number" });
    }

    const resolvedTypeId =
      property_type_id || (await getPropertyTypeIdByName(property_type));
    if (!resolvedTypeId) {
      return res.status(400).json({ error: "Invalid property type" });
    }

    const property = await createProperty({
      owner_id,
      property_type_id: resolvedTypeId,
      location,
      description: description || null,
      price,
      listing_purpose: "sale",
      listing_type: listing_type || null,
      sale_status: sale_status || "available",
    });

    await createPropertyVerificationRequest(property.id);

    if (property_type === "land" && land) {
      await createLandDetails({ property_id: property.id, ...land });
    }
    if (property_type === "house" && house) {
      await createHouseDetails({ property_id: property.id, ...house });
    }

    if (Array.isArray(images)) {
      await addPropertyImages(property.id, images);
    }

    res.status(201).json({ message: "Property created", property });
  } catch (err) {
    next(err);
  }
}
