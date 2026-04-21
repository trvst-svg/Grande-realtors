import {
  getPropertyWithVerification,
  rejectPropertyVerificationRequest,
} from "../../models/property.model.js";
import { getUserById } from "../../models/user.model.js";
import { sendPropertyStatusEmail } from "../../utils/mailer.js";

export default async function rejectPropertyRequest(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const reason = req.body?.reason?.trim();
    if (!requestId) {
      return res.status(400).json({ error: "Request id is required" });
    }
    const updated = await rejectPropertyVerificationRequest(requestId);
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
          status: "rejected",
          property: {
            type: property.property_type,
            location: property.location,
            price: property.price,
          },
          reason,
        });
      } catch (emailError) {
        if (emailError.code !== "MAIL_NOT_CONFIGURED") {
          console.error("Failed to send property rejection email:", emailError);
        }
      }
    }

    return res.json({ message: "Property rejected", request: updated });
  } catch (err) {
    return next(err);
  }
}
