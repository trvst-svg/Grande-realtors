import { listMessageThreads } from "../../models/message.model.js";

export default async function listMessageThreadsHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const threads = await listMessageThreads(userId);
    return res.json({ items: threads });
  } catch (err) {
    return next(err);
  }
}
