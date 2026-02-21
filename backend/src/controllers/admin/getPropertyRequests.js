import { listPendingPropertyVerificationRequests } from "../../models/property.model.js";

export default async function getPropertyRequests(_req, res, next) {
  try {
    const items = await listPendingPropertyVerificationRequests();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
