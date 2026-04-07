import { getAuctionById, updateAuctionStatus } from "../../models/auction.model.js";
import {
  getBidTicketByUserAuction,
  upsertBidTicket,
} from "../../models/payment.model.js";
import { getRoleIdByName, getUserById } from "../../models/user.model.js";

async function requestKhaltiPayment({
  return_url,
  website_url,
  amount,
  purchase_order_id,
  purchase_order_name,
  customer_info,
}) {
  const gatewayUrl =
    process.env.KHALTI_GATEWAY_URL ||
    "https://dev.khalti.com/api/v2/epayment/initiate/";
  const secretKey = process.env.KHALTI_SECRET_KEY;
  if (!secretKey) {
    const error = new Error("Khalti secret key is not configured");
    error.status = 500;
    throw error;
  }

  if (typeof fetch !== "function") {
    const error = new Error("Fetch is not available in this environment");
    error.status = 500;
    throw error;
  }

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.detail || data?.error || "Khalti payment initiation failed";
    const error = new Error(message);
    error.status = 400;
    throw error;
  }

  return data;
}

const TICKET_AMOUNT = Number(process.env.BID_TICKET_AMOUNT || 1000);
function getBackendBaseUrl(req) {
  const envUrl = process.env.BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

export default async function initiateBidTicket(req, res, next) {
  try {
    const auctionId = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const buyerRoleId = await getRoleIdByName("buyer");
    const userRoleId = await getRoleIdByName("user");
    const isBuyer =
      req.user?.role_id === buyerRoleId || req.user?.role_id === userRoleId;
    if (!isBuyer) {
      return res.status(403).json({ error: "Only buyers can purchase bid tickets" });
    }

    if (!auctionId) {
      return res.status(400).json({ error: "Auction id is required" });
    }

    const auction = await getAuctionById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    if (auction.owner_id === userId) {
      return res
        .status(403)
        .json({ error: "Owners cannot bid on their own property" });
    }
    const now = new Date();
    if (auction.end_time) {
      const endTime = new Date(auction.end_time);
      if (now > endTime) {
        await updateAuctionStatus(auction.id, "closed");
        return res.status(400).json({ error: "Auction has ended" });
      }
    }
    if (auction.status === "closed") {
      return res.status(400).json({ error: "Auction is closed" });
    }

    const existing = await getBidTicketByUserAuction(auctionId, userId);
    if (existing && existing.status === "paid") {
      return res.json({ status: "paid", amount: existing.amount });
    }

    const totalAmount = Number.isFinite(TICKET_AMOUNT) ? TICKET_AMOUNT : 1000;

    const transactionUuid = `bid-${auctionId}-${userId}-${Date.now()}`;

    const user = await getUserById(userId);
    const backendBase = getBackendBaseUrl(req);
    const frontendBase =
      process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";

    const payment = await requestKhaltiPayment({
      return_url:
        process.env.KHALTI_RETURN_URL ||
        `${backendBase}/api/payments/khalti/return`,
      website_url: process.env.KHALTI_WEBSITE_URL || frontendBase,
      amount: totalAmount * 100,
      purchase_order_id: transactionUuid,
      purchase_order_name: `Bid Ticket ${auctionId}`,
      customer_info: {
        name: user ? `${user.firstname} ${user.lastname}`.trim() : "Bidder",
        email: user?.email || "unknown@granderealtors.com",
        phone: user?.number || "N/A",
      },
    });

    const ticket = await upsertBidTicket({
      auctionId,
      userId,
      transactionUuid,
      amount: totalAmount,
      status: "pending",
      transactionCode: payment?.pidx || null,
    });

    return res.json({
      status: ticket.status,
      amount: ticket.amount,
      payment: {
        provider: "khalti",
        payment_url: payment.payment_url,
        pidx: payment.pidx,
        expires_at: payment.expires_at,
      },
    });
  } catch (err) {
    next(err);
  }
}
