import { getUserById, rejectUser } from "../../models/user.model.js";
import { sendRejectionEmail } from "../../utils/mailer.js";

export default async function rejectSignup(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User id is required" });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.approval_status !== "pending") {
      return res.status(409).json({ error: "Signup already reviewed" });
    }

    try {
      await sendRejectionEmail({
        to: user.email,
        name: `${user.firstname} ${user.lastname}`.trim(),
        reason: reason.trim(),
      });
    } catch (emailError) {
      if (emailError.code === "MAIL_NOT_CONFIGURED") {
        return res.status(500).json({
          error: "Email is not configured. Please set SMTP credentials.",
        });
      }
      return next(emailError);
    }

    const updated = await rejectUser(userId, reason.trim(), req.user?.id || null);
    if (!updated) {
      return res.status(409).json({ error: "Signup already reviewed or missing" });
    }
    return res.json({ message: "User rejected and email sent", user: updated });
  } catch (err) {
    return next(err);
  }
}
