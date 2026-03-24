import jwt from "jsonwebtoken";
import {
  getRoleNameById,
  getUserById,
} from "../../models/user.model.js";
import {
  getRefreshTokenByHash,
  rotateRefreshToken,
} from "../../models/refreshToken.model.js";
import buildUserPayload from "./buildUserPayload.js";
import {
  buildRefreshCookieOptions,
  generateRefreshToken,
  getRefreshTokenCookieName,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from "../../utils/refreshToken.js";

export default async function refreshToken(req, res, next) {
  try {
    const token =
      req.body?.refresh_token ||
      req.cookies?.[getRefreshTokenCookieName()] ||
      req.headers["x-refresh-token"];

    if (!token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const tokenHash = hashRefreshToken(token);
    const stored = await getRefreshTokenByHash(tokenHash);
    if (!stored) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const user = await getUserById(stored.user_id);
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token user" });
    }

    if (user.approval_status === "pending") {
      return res
        .status(403)
        .json({ error: "Your account is pending admin approval." });
    }
    if (user.approval_status === "rejected") {
      const reason = user.approval_reason || "Please contact support for details.";
      return res
        .status(403)
        .json({ error: `Your signup was rejected. ${reason}` });
    }

    const roleName = await getRoleNameById(user.role_id);
    const payload = { id: user.id, email: user.email, role_id: user.role_id };
    const secret =
      process.env.JWT_SECRET || process.env.SECRET_KEY || "dev-secret";
    const accessToken = jwt.sign(payload, secret, { expiresIn: "5h" });

    const nextRefreshToken = generateRefreshToken();
    const nextRefreshHash = hashRefreshToken(nextRefreshToken);
    const nextRefreshExpiry = getRefreshTokenExpiry();
    await rotateRefreshToken(stored.id, nextRefreshHash, nextRefreshExpiry);

    res.cookie(
      getRefreshTokenCookieName(),
      nextRefreshToken,
      buildRefreshCookieOptions()
    );

    return res.json({
      token: accessToken,
      refresh_token: nextRefreshToken,
      user: buildUserPayload(user, roleName),
    });
  } catch (err) {
    return next(err);
  }
}
