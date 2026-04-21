import {
  getBidTicketByUserAuction,
  markBidTicketFailed,
  markBidTicketPaid,
} from "../../models/payment.model.js";

async function lookupKhaltiPayment(pidx) {
  const lookupUrl =
    process.env.KHALTI_LOOKUP_URL ||
    "https://dev.khalti.com/api/v2/epayment/lookup/";
  const secretKey = process.env.KHALTI_SECRET_KEY;
  if (!secretKey || !pidx || typeof fetch !== "function") {
    return null;
  }

  const response = await fetch(lookupUrl, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json().catch(() => null);
}

function isKhaltiPaidStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return normalized === "completed";
}

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

    let resolvedTicket = ticket;

    // Self-heal pending tickets by reconciling against Khalti when the user
    // returns from checkout and the callback did not update local state yet.
    if (ticket.status !== "paid" && ticket.transaction_code) {
      const lookup = await lookupKhaltiPayment(ticket.transaction_code);
      const lookupAmount = Number(lookup?.total_amount);
      const expectedAmount = Number(ticket.amount) * 100;

      if (
        lookup &&
        lookup.pidx === ticket.transaction_code &&
        Number.isFinite(lookupAmount) &&
        lookupAmount === expectedAmount
      ) {
        if (isKhaltiPaidStatus(lookup.status)) {
          resolvedTicket =
            (await markBidTicketPaid({
              transactionUuid: ticket.transaction_uuid,
              transactionCode: ticket.transaction_code,
              amount: ticket.amount,
            })) || ticket;
        } else if (
          String(lookup.status || "").trim() &&
          String(lookup.status || "").trim().toLowerCase() !== "pending"
        ) {
          resolvedTicket =
            (await markBidTicketFailed(ticket.transaction_uuid)) || ticket;
        }
      }
    }

    return res.json({
      status: resolvedTicket.status,
      amount: resolvedTicket.amount,
      paid_at: resolvedTicket.paid_at,
    });
  } catch (err) {
    next(err);
  }
}
