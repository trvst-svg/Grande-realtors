import crypto from "crypto";

const DEFAULT_REFRESH_TTL_DAYS = 30;
const REFRESH_COOKIE_NAME = "gr_refresh";

export function getRefreshTokenCookieName() {
  return REFRESH_COOKIE_NAME;
}

export function getRefreshTokenTtlMs() {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS) || DEFAULT_REFRESH_TTL_DAYS;
  return days * 24 * 60 * 60 * 1000;
}

export function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

export function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiry() {
  return new Date(Date.now() + getRefreshTokenTtlMs());
}

export function buildRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: getRefreshTokenTtlMs(),
  };
}
