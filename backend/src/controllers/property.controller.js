import {
  addPropertyImages,
  createHouseDetails,
  createLandDetails,
  createProperty,
  createPropertyVerificationRequest,
  getPropertyById,
  getPropertyImages,
  getPropertyTypeIdByName,
  listProperties,
  listPropertiesByType,
  searchProperties,
  updateProperty,
  deleteProperty,
} from "../models/property.model.js";

export async function createPropertyHandler(req, res, next) {
  try {
    const {
      owner_id,
      property_type,
      property_type_id,
      location,
      description,
      price,
      sale_status,
      images,
      land,
      house,
    } = req.body;

    if (!owner_id || !location || !price || (!property_type && !property_type_id)) {
      return res.status(400).json({ error: "Missing required fields" });
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

export async function listPropertiesHandler(_req, res, next) {
  try {
    const properties = await listProperties();
    res.json({ items: properties });
  } catch (err) {
    next(err);
  }
}

export async function listPropertiesByTypeHandler(req, res, next) {
  try {
    const { type } = req.params;
    const properties = await listPropertiesByType(type);
    res.json({ items: properties });
  } catch (err) {
    next(err);
  }
}

export async function searchPropertiesHandler(req, res, next) {
  try {
    const { type, location, min_price, max_price, status } = req.query;
    const items = await searchProperties({
      type,
      location,
      min_price,
      max_price,
      status,
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function getPropertyHandler(req, res, next) {
  try {
    const property = await getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    const images = await getPropertyImages(property.id);
    res.json({ ...property, images });
  } catch (err) {
    next(err);
  }
}

export async function addPropertyImagesHandler(req, res, next) {
  try {
    const property = await getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "No images uploaded" });
    }
    const imageUrls = files.map(
      (file) => `/uploads/properties/${file.filename}`
    );
    await addPropertyImages(property.id, imageUrls);
    res.status(201).json({ message: "Images uploaded", images: imageUrls });
  } catch (err) {
    next(err);
  }
}

export async function updatePropertyHandler(req, res, next) {
  try {
    const { location, description, price, sale_status, property_type_id } =
      req.body;
    const updated = await updateProperty(req.params.id, {
      location,
      description,
      price,
      sale_status,
      property_type_id,
    });
    if (!updated) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property updated", property: updated });
  } catch (err) {
    next(err);
  }
}

export async function deletePropertyHandler(req, res, next) {
  try {
    const deleted = await deleteProperty(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property deleted" });
  } catch (err) {
    next(err);
  }
}
