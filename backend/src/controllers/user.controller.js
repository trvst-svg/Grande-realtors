import { getUserProfile } from "../models/user.model.js";

export async function getUserProfileHandler(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ error: "User id is required" });
    }
    const data = await getUserProfile(userId);
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
}
