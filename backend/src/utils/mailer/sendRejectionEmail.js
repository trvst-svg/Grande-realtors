import getTransporter from "./getTransporter.js";

export default async function sendRejectionEmail({ to, name, reason }) {
  const transporter = getTransporter();
  if (!transporter) {
    const error = new Error("Email transport is not configured");
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  }

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = "Your Grande Realtors signup request";
  const safeName = name && name.trim().length ? name.trim() : "there";
  const safeReason = reason && reason.trim().length ? reason.trim() : "Not specified.";
  const safeHtmlName = escapeHtml(safeName);
  const safeHtmlReason = escapeHtml(safeReason);

  const text = `Hi ${safeName},\n\nYour signup request was not approved.\nReason: ${safeReason}\n\nIf you believe this is a mistake, please contact support.\n\nGrande Realtors`;

  const html = `
    <div style="background:#f2ede5;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,0.12);">
        <div style="background:#1a1a1a;padding:18px 24px;color:#f7f1e8;font-size:18px;font-weight:700;">Grande Realtors</div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#1f1f1f;">Signup update</h2>
          <p style="margin:0 0 12px;color:#4b463e;">Hi ${safeHtmlName},</p>
          <p style="margin:0 0 12px;color:#4b463e;">Your signup request was not approved.</p>
          <p style="margin:0 0 18px;color:#4b463e;"><strong>Reason:</strong> ${safeHtmlReason}</p>
          <p style="margin:0;color:#6d655b;font-size:12px;">If you believe this is a mistake, please contact support.</p>
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
