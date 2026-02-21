import { deleteProperty, getPropertyById } from "../../models/property.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function deletePropertyHandler(req, res, next) {
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

    const deleted = await deleteProperty(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property deleted" });
  } catch (err) {
    next(err);
  }
}
