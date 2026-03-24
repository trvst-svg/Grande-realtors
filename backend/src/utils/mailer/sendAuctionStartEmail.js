import getTransporter from "./getTransporter.js";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function sendAuctionStartEmail({
  to,
  name,
  auction,
  frontendBase,
}) {
  const transporter = getTransporter();
  if (!transporter) {
    const error = new Error("Email transport is not configured");
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  }

  const safeName = name && name.trim().length ? name.trim() : "there";
  const safeHtmlName = escapeHtml(safeName);
  const safeFrontend = (frontendBase || "").replace(/\/$/, "");

  const title = `${auction.property_type || "Property"} in ${auction.location || ""}`.trim();
  const startTime = auction.start_time
    ? new Date(auction.start_time).toLocaleString()
    : "now";
  const endTime = auction.end_time
    ? new Date(auction.end_time).toLocaleString()
    : "TBD";
  const link = auction.id ? `${safeFrontend}/bidding/${auction.id}` : safeFrontend;
  const subject = "Auction is now live";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const text = `Hi ${safeName},\n\nThe auction for ${title} is now live.\nStart: ${startTime}\nEnd: ${endTime}\n\nPlace your bid: ${link}\n\nGrande Realtors`;

  const html = `
    <div style="background:#f2ede5;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,0.12);">
        <div style="background:#1a1a1a;padding:18px 24px;color:#f7f1e8;font-size:18px;font-weight:700;">Grande Realtors</div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#1f1f1f;">Auction is live</h2>
          <p style="margin:0 0 12px;color:#4b463e;">Hi ${safeHtmlName}, the auction for <strong>${escapeHtml(
            title
          )}</strong> has just started.</p>
          <p style="margin:0 0 6px;color:#4b463e;"><strong>Start:</strong> ${escapeHtml(
            startTime
          )}</p>
          <p style="margin:0 0 18px;color:#4b463e;"><strong>End:</strong> ${escapeHtml(
            endTime
          )}</p>
          <a href="${link}" style="display:inline-block;background:#1f4b43;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">Place Your Bid</a>
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
