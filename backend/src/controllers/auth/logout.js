import { getRefreshTokenByHash, revokeRefreshToken } from "../../models/refreshToken.model.js";
import {
  buildRefreshCookieOptions,
  getRefreshTokenCookieName,
  hashRefreshToken,
} from "../../utils/refreshToken.js";

export default async function logout(req, res, next) {
  try {
    const token =
      req.body?.refresh_token ||
      req.cookies?.[getRefreshTokenCookieName()] ||
      req.headers["x-refresh-token"];

    if (token) {
      const tokenHash = hashRefreshToken(token);
      const stored = await getRefreshTokenByHash(tokenHash);
      if (stored) {
        await revokeRefreshToken(stored.id);
      }
    }

    res.clearCookie(getRefreshTokenCookieName(), buildRefreshCookieOptions());
    return res.json({ message: "Logged out" });
  } catch (err) {
    return next(err);
  }
}
