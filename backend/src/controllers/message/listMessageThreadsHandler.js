import { listMessageThreads } from "../../models/message.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function listMessageThreadsHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const adminRoleId = await getRoleIdByName("admin");
    const isAdmin = req.user?.role_id === adminRoleId;
    const items = await listMessageThreads({ userId, isAdmin });
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}
