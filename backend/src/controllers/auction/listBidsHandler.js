import { getAuctionById, listBidsByAuction } from "../../models/auction.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function listBidsHandler(req, res, next) {
  try {
    const auction = await getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    const adminRoleId = await getRoleIdByName("admin");
    const agentRoleId = await getRoleIdByName("agent");
    if (!adminRoleId || !agentRoleId) {
      return res.status(500).json({ error: "Roles not configured" });
    }
    const isPrivileged =
      req.user?.role_id === adminRoleId || req.user?.role_id === agentRoleId;
    if (!isPrivileged && auction.owner_id !== req.user?.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const items = await listBidsByAuction(req.params.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
