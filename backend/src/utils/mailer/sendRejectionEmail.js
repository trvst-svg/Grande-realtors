import getTransporter from "./getTransporter.js";

export default async function sendRejectionEmail({ to, name, reason }) {
  const transporter = getTransporter();
  if (!transporter) {
    const error = new Error("Email transport is not configured");
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = "Your Grande Realtors signup request";
  const safeName = name && name.trim().length ? name.trim() : "there";
  const safeReason = reason && reason.trim().length ? reason.trim() : "Not specified.";

  const text = `Hi ${safeName},\n\nYour signup request was not approved.\nReason: ${safeReason}\n\nIf you believe this is a mistake, please contact support.\n\nGrande Realtors`;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });
}
