import { listInquiriesByProperty } from "../../models/inquiry.model.js";
import {
  getPropertyById,
  getSalesHandlerByPropertyId,
} from "../../models/property.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function listPropertyInquiriesHandler(req, res, next) {
  try {
    const propertyId = Number(req.params.id);
    const userId = req.user?.id;

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

    const adminRoleId = await getRoleIdByName("admin");
    const agentRoleId = await getRoleIdByName("agent");
    const salesHandler = await getSalesHandlerByPropertyId(propertyId);
    const isPrivileged =
      req.user?.role_id === adminRoleId || req.user?.role_id === agentRoleId;
    const isOwner = property.owner_id === userId;
    const isAssignedAgent = salesHandler?.id === userId;

    if (!isOwner && !isPrivileged && !isAssignedAgent) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const items = await listInquiriesByProperty(propertyId);
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}
