import {
  getAuctionById,
  getBidById,
  rejectOtherBids,
  updateAuctionStatus,
  updateBidStatus,
} from "../../models/auction.model.js";
import { getPropertyById, updateProperty } from "../../models/property.model.js";
import { getRoleIdByName, getUserById } from "../../models/user.model.js";
import { createTransaction } from "../../models/transaction.model.js";
import { createContract } from "../../models/contract.model.js";
import buildContractText from "../../utils/buildContractText.js";
import { getSalesHandlerByPropertyId } from "../../models/property.model.js";

export default async function updateBidStatusHandler(req, res, next) {
  try {
    const auctionId = Number(req.params.id);
    const bidId = Number(req.params.bidId);
    const status = req.body?.status?.toLowerCase();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!auctionId || !bidId) {
      return res.status(400).json({ error: "Auction and bid id are required" });
    }
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid bid status" });
    }

    const auction = await getAuctionById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    const bid = await getBidById(bidId);
    if (!bid || bid.auction_id !== auctionId) {
      return res.status(404).json({ error: "Bid not found" });
    }

    const adminRoleId = await getRoleIdByName("admin");
    const agentRoleId = await getRoleIdByName("agent");
    if (!adminRoleId || !agentRoleId) {
      return res.status(500).json({ error: "Roles not configured" });
    }
    const isPrivileged =
      req.user?.role_id === adminRoleId || req.user?.role_id === agentRoleId;
    if (!isPrivileged && auction.owner_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await updateBidStatus(bidId, status);
    if (!updated) {
      return res.status(404).json({ error: "Bid not found" });
    }

    if (status === "accepted") {
      await rejectOtherBids(auctionId, bidId);
      await updateAuctionStatus(auctionId, "closed");
      await updateProperty(auction.property_id, {
        sale_status: "sold",
      });

      const property = await getPropertyById(auction.property_id);
      const buyer = await getUserById(bid.user_id);
      const seller = await getUserById(auction.owner_id);
      const salesHandler = await getSalesHandlerByPropertyId(auction.property_id);

      if (property && buyer && seller) {
        const transaction = await createTransaction({
          property_id: property.id,
          buyer_id: buyer.id,
          seller_id: seller.id,
          handler_id: salesHandler?.id || null,
          amount: bid.bid_amount,
          payment_method: "auction",
        });

        const contractText = buildContractText({
          buyer,
          seller,
          property,
          bid,
          createdAt: new Date(),
        });

        await createContract({
          bid_id: bid.id,
          property_id: property.id,
          buyer_id: buyer.id,
          seller_id: seller.id,
          transaction_id: transaction?.id,
          contract_text: contractText,
        });
      }
    }

    return res.json({ message: "Bid updated", bid: updated });
  } catch (err) {
    return next(err);
  }
}
