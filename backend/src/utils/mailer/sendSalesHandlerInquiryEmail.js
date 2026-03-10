import getTransporter from "./getTransporter.js";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function sendSalesHandlerInquiryEmail({
  to,
  handlerName,
  senderName,
  senderEmail,
  senderPhone,
  message,
  property,
}) {
  const transporter = getTransporter();
  if (!transporter) {
    const error = new Error("Email transport is not configured");
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = `New inquiry: ${property?.type || "Property"} in ${property?.location || ""}`;
  const safeHandler = handlerName && handlerName.trim().length ? handlerName.trim() : "Sales Handler";
  const safeSender = senderName && senderName.trim().length ? senderName.trim() : "Client";
  const safeEmail = senderEmail || "";
  const safePhone = senderPhone || "";
  const safeMessage = message && message.trim().length ? message.trim() : "(No message provided)";
  const safeHtmlHandler = escapeHtml(safeHandler);
  const safeHtmlSender = escapeHtml(safeSender);
  const safeHtmlEmail = escapeHtml(safeEmail);
  const safeHtmlPhone = escapeHtml(safePhone || "-");
  const safeHtmlMessage = escapeHtml(safeMessage);
  const safeHtmlType = escapeHtml(property?.type || "Property");
  const safeHtmlLocation = escapeHtml(property?.location || "-");
  const safeHtmlListingType = escapeHtml(property?.listing_type || "-");
  const safeHtmlPurpose = escapeHtml(property?.listing_purpose || "-");
  const safeHtmlId = escapeHtml(property?.id || "-");

  const text = `Hi ${safeHandler},\n\nYou have a new inquiry for the following property:\n\nProperty: ${property?.type || "Property"}\nLocation: ${property?.location || "-"}\nPrice: ${property?.price ? `NPR ${property.price}` : "-"}\nListing Type: ${property?.listing_type || "-"}\nListing Purpose: ${property?.listing_purpose || "-"}\nProperty ID: ${property?.id || "-"}\n\nClient Details:\nName: ${safeSender}\nEmail: ${safeEmail}\nPhone: ${safePhone}\n\nMessage:\n${safeMessage}\n\nGrande Realtors`;

  const html = `
    <div style="background:#f2ede5;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,0.12);">
        <div style="background:#1a1a1a;padding:18px 24px;color:#f7f1e8;font-size:18px;font-weight:700;">Grande Realtors</div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#1f1f1f;">New property inquiry</h2>
          <p style="margin:0 0 12px;color:#4b463e;">Hi ${safeHtmlHandler},</p>
          <p style="margin:0 0 16px;color:#4b463e;">You have a new inquiry for the property below.</p>

          <div style="background:#f7f2ea;border-radius:12px;padding:12px 16px;margin-bottom:16px;">
            <p style="margin:0 0 6px;font-weight:600;">${safeHtmlType}</p>
            <p style="margin:0 0 4px;color:#4b463e;">Location: ${safeHtmlLocation}</p>
            <p style="margin:0 0 4px;color:#4b463e;">Price: ${property?.price ? `NPR ${property.price}` : "-"}</p>
            <p style="margin:0 0 4px;color:#4b463e;">Listing Type: ${safeHtmlListingType}</p>
            <p style="margin:0 0 4px;color:#4b463e;">Purpose: ${safeHtmlPurpose}</p>
            <p style="margin:0;color:#4b463e;">Property ID: ${safeHtmlId}</p>
          </div>

          <div style="margin-bottom:16px;">
            <p style="margin:0 0 6px;font-weight:600;">Client Details</p>
            <p style="margin:0 0 4px;color:#4b463e;">Name: ${safeHtmlSender}</p>
            <p style="margin:0 0 4px;color:#4b463e;">Email: ${safeHtmlEmail}</p>
            <p style="margin:0;color:#4b463e;">Phone: ${safeHtmlPhone}</p>
          </div>

          <div style="background:#fff6e2;border-radius:12px;padding:12px 16px;">
            <p style="margin:0 0 6px;font-weight:600;">Message</p>
            <p style="margin:0;color:#4b463e;white-space:pre-line;">${safeHtmlMessage}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    replyTo: senderEmail || undefined,
  });
}
