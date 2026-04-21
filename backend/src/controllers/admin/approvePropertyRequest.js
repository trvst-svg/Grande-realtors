import {
  approvePropertyVerificationRequestWithAgent,
  getPropertyWithVerification,
} from "../../models/property.model.js";
import { getRoleIdByName, getUserById } from "../../models/user.model.js";
import { sendPropertyStatusEmail } from "../../utils/mailer.js";

export default async function approvePropertyRequest(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    if (!requestId) {
      return res.status(400).json({ error: "Request id is required" });
    }
    const agentRoleId = await getRoleIdByName("agent");
    const adminRoleId = await getRoleIdByName("admin");
    if (!agentRoleId || !adminRoleId) {
      return res.status(500).json({ error: "Roles not configured" });
    }

    const isAgent = req.user?.role_id === agentRoleId;
    let assignedAgentId = Number(req.body?.agent_id || 0);
    if (!assignedAgentId && isAgent) {
      assignedAgentId = req.user?.id;
    }
    if (!assignedAgentId) {
      return res.status(400).json({ error: "Sales handler is required" });
    }

    const agent = await getUserById(assignedAgentId);
    if (!agent || agent.role_id !== agentRoleId) {
      return res.status(400).json({ error: "Invalid sales handler" });
    }
    if (agent.approval_status !== "approved") {
      return res.status(400).json({ error: "Sales handler is not approved" });
    }

    const updated = await approvePropertyVerificationRequestWithAgent(
      requestId,
      assignedAgentId
    );
    if (!updated) {
      return res
        .status(409)
        .json({ error: "Request already reviewed or missing" });
    }

    const property = await getPropertyWithVerification(updated.property_id);
    const propertyOwner = property ? await getUserById(property.owner_id) : null;
    if (propertyOwner?.email) {
      try {
        await sendPropertyStatusEmail({
          to: propertyOwner.email,
          ownerName: `${propertyOwner.firstname || ""} ${propertyOwner.lastname || ""}`.trim(),
          status: "approved",
          property: {
            type: property.property_type,
            location: property.location,
            price: property.price,
          },
          handlerName: `${agent.firstname || ""} ${agent.lastname || ""}`.trim(),
        });
      } catch (emailError) {
        if (emailError.code !== "MAIL_NOT_CONFIGURED") {
          console.error("Failed to send property approval email:", emailError);
        }
      }
    }

    return res.json({
      message: "Property approved",
      request: updated,
      assigned_agent_id: assignedAgentId,
    });
  } catch (err) {
    return next(err);
  }
}
