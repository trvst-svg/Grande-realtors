import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  findUserByEmail,
  getRoleNameById,
} from "../../models/user.model.js";
import { createRefreshToken } from "../../models/refreshToken.model.js";
import buildUserPayload from "./buildUserPayload.js";
import {
  buildRefreshCookieOptions,
  generateRefreshToken,
  getRefreshTokenCookieName,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from "../../utils/refreshToken.js";

export default async function login(req, res, next) {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password;

    if ([email, password].some((v) => !v)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Approval status is enforced before issuing tokens so admins control access.
    if (user.approval_status === "pending") {
      return res
        .status(403)
        .json({ error: "Your account is pending admin approval." });
    }

    if (user.approval_status === "rejected") {
      const reason =
        user.approval_reason || "Please contact support for details.";
      return res
        .status(403)
        .json({ error: `Your signup was rejected. ${reason}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const roleName = await getRoleNameById(user.role_id);
    const payload = { id: user.id, email: user.email, role_id: user.role_id };
    const secret =
      process.env.JWT_SECRET || process.env.SECRET_KEY || "dev-secret";
    // Keep the access token short-lived and rely on refresh-token rotation for sessions.
    const token = jwt.sign(payload, secret, { expiresIn: "5h" });
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const refreshExpiresAt = getRefreshTokenExpiry();
    await createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: refreshExpiresAt,
    });

    res.cookie(
      getRefreshTokenCookieName(),
      refreshToken,
      buildRefreshCookieOptions()
    );

    // The frontend currently bootstraps from both cookies and local storage.
    return res.status(200).json({
      message: "Login successful",
      token,
      refresh_token: refreshToken,
      user: buildUserPayload(user, roleName),
    });
  } catch (err) {
    return next(err);
  }
}
