import { getPropertyById } from "../../models/property.model.js";
import { listMessagesByThread } from "../../models/message.model.js";

export default async function listMessagesHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    const propertyId = Number(req.query.property_id);
    let participantId = Number(req.query.participant_id);

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

    const ownerId = property.owner_id;
    if (userId !== ownerId) {
      participantId = ownerId;
    } else if (!participantId) {
      return res.status(400).json({ error: "Participant id is required" });
    }

    const messages = await listMessagesByThread({
      propertyId,
      userId,
      participantId,
    });

    return res.json({ items: messages, owner_id: ownerId });
  } catch (err) {
    return next(err);
  }
}
