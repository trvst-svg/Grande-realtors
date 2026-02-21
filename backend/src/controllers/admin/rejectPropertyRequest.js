import { rejectPropertyVerificationRequest } from "../../models/property.model.js";

export default async function rejectPropertyRequest(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    if (!requestId) {
      return res.status(400).json({ error: "Request id is required" });
    }
    const updated = await rejectPropertyVerificationRequest(requestId);
    if (!updated) {
      return res
        .status(409)
        .json({ error: "Request already reviewed or missing" });
    }
    return res.json({ message: "Property rejected", request: updated });
  } catch (err) {
    return next(err);
  }
}
