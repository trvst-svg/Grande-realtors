import { getSalesHandlerProfile } from "../../models/agent.model.js";

export default async function getSalesHandlerProfileHandler(req, res, next) {
  try {
    const agentId = Number(req.params.id);
    if (!agentId) {
      return res.status(400).json({ error: "Agent id is required" });
    }
    const data = await getSalesHandlerProfile(agentId);
    if (!data) {
      return res.status(404).json({ error: "Sales handler not found" });
    }
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}
