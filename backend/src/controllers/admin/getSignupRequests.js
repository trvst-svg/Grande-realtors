import { listPendingUsers } from "../../models/user.model.js";

export default async function getSignupRequests(_req, res, next) {
  try {
    const items = await listPendingUsers();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
