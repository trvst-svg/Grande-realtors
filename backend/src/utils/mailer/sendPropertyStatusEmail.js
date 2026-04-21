import getTransporter from "./getTransporter.js";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function sendPropertyStatusEmail({
  to,
  ownerName,
  status,
  property,
  handlerName,
  reason,
}) {
  const transporter = getTransporter();
  if (!transporter) {
    const error = new Error("Email transport is not configured");
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  }

  const safeName = ownerName && ownerName.trim().length ? ownerName.trim() : "there";
  const safeStatus = String(status || "").toLowerCase();
  const safePropertyType = property?.type || "property";
  const safeLocation = property?.location || "your listing";
  const safePrice = property?.price ? `NPR ${property.price}` : "Price not specified";
  const safeHandlerName =
    handlerName && handlerName.trim().length ? handlerName.trim() : "our sales team";
  const safeReason =
    reason && reason.trim().length ? reason.trim() : "Please contact support for details.";

  const isApproved = safeStatus === "approved";
  const subject = isApproved
    ? "Your property has been approved"
    : "Your property was not approved";

  const introText = isApproved
    ? `Your ${safePropertyType} listing in ${safeLocation} has been approved.`
    : `Your ${safePropertyType} listing in ${safeLocation} was not approved.`;

  const detailText = isApproved
    ? `Assigned sales handler: ${safeHandlerName}`
    : `Reason: ${safeReason}`;

  const actionText = isApproved
    ? "Our assigned sales handler will now be able to follow up on this listing."
    : "You can review the listing details and submit a corrected request if needed.";

  const safeHtmlName = escapeHtml(safeName);
  const safeHtmlIntro = escapeHtml(introText);
  const safeHtmlDetail = escapeHtml(detailText);
  const safeHtmlAction = escapeHtml(actionText);
  const safeHtmlType = escapeHtml(safePropertyType);
  const safeHtmlLocation = escapeHtml(safeLocation);
  const safeHtmlPrice = escapeHtml(safePrice);
  const bannerColor = isApproved ? "#1f7a46" : "#b43b3b";
  const bannerTitle = isApproved ? "Property Approved" : "Property Rejected";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const text = `Hi ${safeName},

${introText}
${detailText}

Property details:
- Type: ${safePropertyType}
- Location: ${safeLocation}
- Price: ${safePrice}

${actionText}

Grande Realtors`;

  const html = `
    <div style="background:#f2ede5;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,0.12);">
        <div style="background:${bannerColor};padding:18px 24px;color:#f7f1e8;font-size:18px;font-weight:700;">
          ${bannerTitle}
        </div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#1f1f1f;">Hi ${safeHtmlName},</h2>
          <p style="margin:0 0 12px;color:#4b463e;">${safeHtmlIntro}</p>
          <p style="margin:0 0 18px;color:#4b463e;"><strong>${safeHtmlDetail}</strong></p>
          <div style="background:#f8f4ec;border:1px solid #eadfcd;border-radius:12px;padding:16px;margin-bottom:18px;">
            <p style="margin:0 0 8px;color:#4b463e;"><strong>Type:</strong> ${safeHtmlType}</p>
            <p style="margin:0 0 8px;color:#4b463e;"><strong>Location:</strong> ${safeHtmlLocation}</p>
            <p style="margin:0;color:#4b463e;"><strong>Price:</strong> ${safeHtmlPrice}</p>
          </div>
          <p style="margin:0;color:#6d655b;font-size:13px;">${safeHtmlAction}</p>
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
  });
}
