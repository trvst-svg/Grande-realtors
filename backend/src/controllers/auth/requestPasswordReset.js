import crypto from "crypto";
import { findUserByEmail } from "../../models/user.model.js";
import { createPasswordReset } from "../../models/passwordReset.model.js";
import { sendPasswordResetEmail } from "../../utils/mailer.js";

function getFrontendBaseUrl(req) {
  const envUrl = process.env.FRONTEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

export default async function requestPasswordReset(req, res, next) {
  try {
    const email = req.body.email?.trim();
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({
        message: "If that email exists, we sent a reset link.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await createPasswordReset({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const frontendBase = getFrontendBaseUrl(req);
    const resetUrl = `${frontendBase}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail({
      to: user.email,
      name: `${user.firstname} ${user.lastname}`.trim(),
      resetUrl,
    });

    return res.json({ message: "If that email exists, we sent a reset link." });
  } catch (err) {
    if (err.code === "MAIL_NOT_CONFIGURED") {
      return res.status(500).json({
        error: "Email is not configured. Please set SMTP credentials.",
      });
    }
    return next(err);
  }
}
