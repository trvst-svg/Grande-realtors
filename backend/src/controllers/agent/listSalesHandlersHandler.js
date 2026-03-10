import { listSalesHandlers } from "../../models/agent.model.js";

export default async function listSalesHandlersHandler(_req, res, next) {
  try {
    const items = await listSalesHandlers();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
