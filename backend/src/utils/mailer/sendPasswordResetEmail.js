import getTransporter from "./getTransporter.js";

export default async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const transporter = getTransporter();
  if (!transporter) {
    const error = new Error("Email transport is not configured");
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = "Reset your Grande Realtors password";
  const safeName = name && name.trim().length ? name.trim() : "there";
  const safeHtmlName = String(safeName)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const safeUrl = resetUrl || "";

  const text = `Hi ${safeName},\n\nWe received a request to reset your password.\n\nUse this link to set a new password:\n${safeUrl}\n\nIf you did not request this, you can safely ignore this email.\n\nGrande Realtors`;

  const html = `
    <div style="background:#f2ede5;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,0.12);">
        <div style="background:#1a1a1a;padding:18px 24px;color:#f7f1e8;font-size:18px;font-weight:700;">Grande Realtors</div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 12px;font-size:22px;color:#1f1f1f;">Reset your password</h2>
          <p style="margin:0 0 12px;color:#4b463e;">Hi ${safeHtmlName},</p>
          <p style="margin:0 0 18px;color:#4b463e;">We received a request to reset your password. Click the button below to set a new one.</p>
          <a href="${safeUrl}" style="display:inline-block;background:#c9a24d;color:#111;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">Reset Password</a>
          <p style="margin:18px 0 0;color:#6d655b;font-size:12px;">If you did not request this, you can safely ignore this email.</p>
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
