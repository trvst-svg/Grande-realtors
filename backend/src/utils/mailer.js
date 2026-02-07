import nodemailer from "nodemailer";

let cachedTransporter = null;

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const transporter = createTransporter();
  if (!transporter) return null;
  cachedTransporter = transporter;
  return cachedTransporter;
}

export async function sendRejectionEmail({ to, name, reason }) {
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
