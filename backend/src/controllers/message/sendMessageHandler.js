import { getPropertyById } from "../../models/property.model.js";
import { createMessage } from "../../models/message.model.js";

export default async function sendMessageHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    const { property_id, receiver_id, body } = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!property_id || !receiver_id || !body?.trim()) {
      return res
        .status(400)
        .json({ error: "Property, receiver, and message are required" });
    }

    const property = await getPropertyById(property_id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const ownerId = property.owner_id;
    const receiverId = Number(receiver_id);
    if (receiverId === userId) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    const isOwner = userId === ownerId;
    if (isOwner) {
      if (receiverId === ownerId) {
        return res.status(400).json({ error: "Invalid receiver" });
      }
    } else if (receiverId !== ownerId) {
      return res.status(403).json({ error: "Messages must go to the owner" });
    }

    const message = await createMessage({
      property_id,
      sender_id: userId,
      receiver_id: receiverId,
      body: body.trim(),
    });

    return res.status(201).json({ message: "Message sent", item: message });
  } catch (err) {
    return next(err);
  }
}
