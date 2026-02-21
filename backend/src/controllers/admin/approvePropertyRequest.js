import { approvePropertyVerificationRequest } from "../../models/property.model.js";

export default async function approvePropertyRequest(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    if (!requestId) {
      return res.status(400).json({ error: "Request id is required" });
    }
    const updated = await approvePropertyVerificationRequest(requestId);
    if (!updated) {
      return res
        .status(409)
        .json({ error: "Request already reviewed or missing" });
    }
    return res.json({ message: "Property approved", request: updated });
  } catch (err) {
    return next(err);
  }
}
