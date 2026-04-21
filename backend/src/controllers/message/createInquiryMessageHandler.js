import {
  createInquiryMessage,
  getInquiryThread,
} from "../../models/message.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function createInquiryMessageHandler(req, res, next) {
  try {
    const inquiryId = Number(req.params.id);
    const senderId = req.user?.id;
    const message = String(req.body?.message || "").trim();

    if (!senderId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!inquiryId) {
      return res.status(400).json({ error: "Inquiry id is required" });
    }
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const thread = await getInquiryThread(inquiryId);
    if (!thread) {
      return res.status(404).json({ error: "Inquiry thread not found" });
    }
    if (!thread.inquiry.agent_id) {
      return res.status(400).json({ error: "No sales handler is assigned to this inquiry" });
    }

    const adminRoleId = await getRoleIdByName("admin");
    const agentRoleId = await getRoleIdByName("agent");
    const isAdmin = req.user?.role_id === adminRoleId;
    const isAssignedAgent =
      req.user?.role_id === agentRoleId && thread.inquiry.agent_id === senderId;
    const isInquiringUser = thread.inquiry.user_id === senderId;

    if (!isAdmin && !isAssignedAgent && !isInquiringUser) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const recipientId = isInquiringUser
      ? thread.inquiry.agent_id
      : thread.inquiry.user_id;

    const created = await createInquiryMessage({
      inquiryId,
      senderId,
      recipientId,
      message,
    });

    return res.status(201).json({
      message: "Message sent.",
      item: created,
    });
  } catch (err) {
    return next(err);
  }
}
