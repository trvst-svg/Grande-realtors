import { getInquiryThread } from "../../models/message.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

function buildInitialInquiryMessage(thread) {
  return {
    id: `inquiry-${thread.inquiry.inquiry_id}`,
    inquiry_id: thread.inquiry.inquiry_id,
    sender_id: thread.inquiry.user_id,
    recipient_id: thread.inquiry.agent_id,
    message: thread.inquiry.inquiry_message,
    created_at: thread.inquiry.inquiry_created_at,
    sender_firstname: thread.inquiry.user_firstname,
    sender_lastname: thread.inquiry.user_lastname,
    is_initial_inquiry: true,
  };
}

export default async function getInquiryThreadHandler(req, res, next) {
  try {
    const inquiryId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!inquiryId) {
      return res.status(400).json({ error: "Inquiry id is required" });
    }

    const thread = await getInquiryThread(inquiryId);
    if (!thread) {
      return res.status(404).json({ error: "Inquiry thread not found" });
    }

    const adminRoleId = await getRoleIdByName("admin");
    const isAdmin = req.user?.role_id === adminRoleId;
    const isParticipant =
      thread.inquiry.user_id === userId || thread.inquiry.agent_id === userId;
    if (!isAdmin && !isParticipant) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const messages = thread.inquiry.inquiry_message
      ? [buildInitialInquiryMessage(thread), ...thread.messages]
      : thread.messages;

    return res.json({
      thread: thread.inquiry,
      messages,
    });
  } catch (err) {
    return next(err);
  }
}
