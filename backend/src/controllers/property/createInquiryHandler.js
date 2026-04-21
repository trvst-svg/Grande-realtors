import { createInquiry } from "../../models/inquiry.model.js";
import {
  getPropertyById,
  getSalesHandlerByPropertyId,
} from "../../models/property.model.js";
import { getUserById } from "../../models/user.model.js";
import { sendSalesHandlerInquiryEmail } from "../../utils/mailer.js";

export default async function createInquiryHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    const propertyId = Number(req.params.id);
    const message = String(req.body?.message || "").trim();
    const senderName = String(req.body?.name || "").trim();
    const senderEmail = String(req.body?.email || "").trim();
    const senderPhone = String(req.body?.phone || "").trim();

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!propertyId) {
      return res.status(400).json({ error: "Property id is required" });
    }
    if (!message) {
      return res.status(400).json({ error: "Inquiry message is required" });
    }

    const property = await getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    if (property.owner_id === userId) {
      return res.status(400).json({ error: "Owners cannot submit inquiries." });
    }

    const salesHandler = await getSalesHandlerByPropertyId(propertyId);
    if (!salesHandler) {
      return res
        .status(400)
        .json({ error: "No sales handler is assigned to this property yet." });
    }

    const sender = await getUserById(userId);
    const inquiry = await createInquiry({
      user_id: userId,
      agent_id: salesHandler.id,
      property_id: propertyId,
      message,
    });

    try {
      if (salesHandler.email) {
        await sendSalesHandlerInquiryEmail({
          to: salesHandler.email,
          handlerName: `${salesHandler.firstname || ""} ${
            salesHandler.lastname || ""
          }`.trim(),
          senderName:
            senderName ||
            `${sender?.firstname || ""} ${sender?.lastname || ""}`.trim(),
          senderEmail: senderEmail || sender?.email || "",
          senderPhone: senderPhone || sender?.number || "",
          message,
          property: {
            id: property.id,
            type: property.property_type,
            location: property.location,
            price: property.price,
            listing_type: property.listing_type,
            listing_purpose: property.listing_purpose,
          },
        });
      }
    } catch (err) {
      if (err.code !== "MAIL_NOT_CONFIGURED") {
        console.error("Failed to send inquiry email", err);
      }
    }

    return res.status(201).json({
      message: "Inquiry submitted successfully.",
      inquiry,
    });
  } catch (err) {
    return next(err);
  }
}
