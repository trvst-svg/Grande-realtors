import crypto from "crypto";
import bcrypt from "bcrypt";
import { findUserByEmail, updateUserPassword } from "../../models/user.model.js";
import {
  getPasswordResetByTokenHash,
  markPasswordResetUsed,
} from "../../models/passwordReset.model.js";

export default async function resetPassword(req, res, next) {
  try {
    const email = req.body.email?.trim();
    const token = req.body.token?.trim();
    const password = req.body.password;

    if (!email || !token || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid reset request" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetEntry = await getPasswordResetByTokenHash(tokenHash);
    if (!resetEntry || resetEntry.user_id !== user.id) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await updateUserPassword(user.id, hashedPassword);
    await markPasswordResetUsed(resetEntry.id);

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return next(err);
  }
}
