import { getContractByBid } from "../../models/contract.model.js";

export default async function getContractHandler(req, res, next) {
  try {
    const bidId = Number(req.params.bidId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!bidId) {
      return res.status(400).json({ error: "Bid id is required" });
    }

    const contract = await getContractByBid(bidId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    if (![contract.buyer_id, contract.seller_id].includes(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({ contract });
  } catch (err) {
    return next(err);
  }
}
