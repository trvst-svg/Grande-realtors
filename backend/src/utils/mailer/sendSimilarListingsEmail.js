import getTransporter from "./getTransporter.js";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatListing(listing) {
  const parts = [];
  if (listing.property_type) parts.push(listing.property_type);
  if (listing.location) parts.push(listing.location);
  return parts.join(" · ");
}

export default async function sendSimilarListingsEmail({
  to,
  name,
  property,
  listings = [],
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

  const propertyTitle = formatListing(property);
  const subject = "Similar listings you may like";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const itemsHtml = listings
    .map((listing) => {
      const title = escapeHtml(formatListing(listing));
      const price = listing.price ? `NPR ${listing.price}` : "Price on request";
      const link = listing.id
        ? `${safeFrontend}/properties/${listing.id}`
        : safeFrontend;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #efe7dd;">
            <div style="font-weight:600;color:#1f1f1f;">${title}</div>
            <div style="font-size:12px;color:#6d655b;">${price}</div>
            <a href="${link}" style="display:inline-block;margin-top:6px;color:#1f4b43;text-decoration:none;font-weight:600;">View Listing →</a>
          </td>
        </tr>
      `;
    })
    .join("");

  const textListings = listings
    .map((listing) => {
      const title = formatListing(listing);
      const price = listing.price ? `NPR ${listing.price}` : "Price on request";
      const link = listing.id ? `${safeFrontend}/properties/${listing.id}` : "";
      return `- ${title} (${price}) ${link}`;
    })
    .join("\n");

  const text = `Hi ${safeName},\n\nYou bookmarked ${propertyTitle}. Here are similar listings you may like:\n${textListings}\n\nGrande Realtors`;

  const html = `
    <div style="background:#f2ede5;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,0.12);">
        <div style="background:#1a1a1a;padding:18px 24px;color:#f7f1e8;font-size:18px;font-weight:700;">Grande Realtors</div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#1f1f1f;">Similar listings picked for you</h2>
          <p style="margin:0 0 18px;color:#4b463e;">Hi ${safeHtmlName}, we noticed you bookmarked <strong>${escapeHtml(
            propertyTitle
          )}</strong>. Here are a few similar listings you might like.</p>
          <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
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
