import { getPropertyWithVerification, getSalesHandlerByPropertyId } from "../../models/property.model.js";
import { createInquiry } from "../../models/inquiry.model.js";
import { sendSalesHandlerInquiryEmail } from "../../utils/mailer.js";

export default async function createPropertyInquiryHandler(req, res, next) {
  try {
    const propertyId = Number(req.params.id);
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const phone = req.body.phone?.trim();
    const message = req.body.message?.trim();

    if (!propertyId) {
      return res.status(400).json({ error: "Property id is required" });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const property = await getPropertyWithVerification(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const salesHandler = await getSalesHandlerByPropertyId(property.id);
    if (!salesHandler || !salesHandler.email) {
      return res.status(409).json({ error: "No sales handler assigned" });
    }

    await sendSalesHandlerInquiryEmail({
      to: salesHandler.email,
      handlerName: `${salesHandler.firstname || ""} ${salesHandler.lastname || ""}`.trim(),
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
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

    const logMessage = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "-"}`,
      "",
      message,
    ].join("\n");

    await createInquiry({
      user_id: req.user?.id,
      agent_id: salesHandler.id,
      property_id: property.id,
      message: logMessage,
    });

    return res.json({ message: "Inquiry sent to sales handler" });
  } catch (err) {
    if (err.code === "MAIL_NOT_CONFIGURED") {
      return res.status(500).json({
        error: "Email is not configured. Please set SMTP credentials.",
      });
    }
    return next(err);
  }
}
