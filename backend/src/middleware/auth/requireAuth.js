import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authorization required" });
  }

  try {
    const secret =
      process.env.JWT_SECRET || process.env.SECRET_KEY || "dev-secret";
    const payload = jwt.verify(token, secret);
    // Downstream handlers use req.user as the authenticated request context.
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
