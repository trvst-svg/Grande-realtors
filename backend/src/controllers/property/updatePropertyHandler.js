import { getPropertyById, updateProperty } from "../../models/property.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function updatePropertyHandler(req, res, next) {
  try {
    const property = await getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const adminRoleId = await getRoleIdByName("admin");
    const agentRoleId = await getRoleIdByName("agent");
    if (!adminRoleId || !agentRoleId) {
      return res.status(500).json({ error: "Roles not configured" });
    }
    const isOwner = property.owner_id === req.user?.id;
    const isPrivileged =
      req.user?.role_id === adminRoleId || req.user?.role_id === agentRoleId;
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const {
      location,
      description,
      price,
      sale_status,
      property_type_id,
      listing_purpose,
      listing_type,
    } = req.body;
    const updated = await updateProperty(req.params.id, {
      location,
      description,
      price,
      sale_status,
      property_type_id,
      listing_purpose,
      listing_type,
    });
    if (!updated) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property updated", property: updated });
  } catch (err) {
    next(err);
  }
}
