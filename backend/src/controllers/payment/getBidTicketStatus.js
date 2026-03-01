import { getBidTicketByUserAuction } from "../../models/payment.model.js";

export default async function getBidTicketStatus(req, res, next) {
  try {
    const auctionId = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }

    if (!auctionId) {
      return res.status(400).json({ error: "Auction id is required" });
    }

    const ticket = await getBidTicketByUserAuction(auctionId, userId);
    if (!ticket) {
      return res.json({ status: "none" });
    }

    return res.json({
      status: ticket.status,
      amount: ticket.amount,
      paid_at: ticket.paid_at,
    });
  } catch (err) {
    next(err);
  }
}
