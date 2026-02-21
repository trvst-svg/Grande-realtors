import { approveUser } from "../../models/user.model.js";

export default async function approveSignup(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ error: "User id is required" });
    }

    const user = await approveUser(userId, req.user?.id || null);
    if (!user) {
      return res.status(409).json({ error: "Signup already reviewed or missing" });
    }

    return res.json({ message: "User approved", user });
  } catch (err) {
    return next(err);
  }
}
