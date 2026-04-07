import {
  getBidTicketByTransaction,
  markBidTicketPaid,
  markBidTicketFailed,
} from "../../models/payment.model.js";

function getFrontendBaseUrl(req) {
  const envUrl = process.env.FRONTEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const origin = req.headers.origin;
  if (origin) return origin;
  return "http://localhost:5173";
}

async function lookupKhaltiPayment(pidx) {
  const lookupUrl =
    process.env.KHALTI_LOOKUP_URL ||
    "https://dev.khalti.com/api/v2/epayment/lookup/";
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

  const response = await fetch(lookupUrl, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.detail || data?.error || "Khalti lookup failed";
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
  return data;
}

export default async function handleKhaltiReturn(req, res, next) {
  try {
    const { pidx } = req.query;
    const frontendBase = getFrontendBaseUrl(req);

    if (!pidx) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    const lookup = await lookupKhaltiPayment(pidx);
    const status = lookup.status;
    const transactionUuid = lookup.purchase_order_id;

    if (!transactionUuid) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    const ticket = await getBidTicketByTransaction(transactionUuid);
    if (!ticket) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    const amount = Number(lookup.total_amount);
    if (!Number.isFinite(amount)) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    if (Number(ticket.amount) * 100 !== amount) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    if (status === "Completed") {
      if (ticket.status !== "paid") {
        await markBidTicketPaid({
          transactionUuid,
          transactionCode: pidx,
          amount: ticket.amount,
        });
      }
      return res.redirect(
        `${frontendBase}/bidding/${ticket.auction_id}?payment=success`
      );
    }

    if (ticket.status !== "failed") {
      await markBidTicketFailed(transactionUuid);
    }
    return res.redirect(`${frontendBase}/bidding/${ticket.auction_id}?payment=failed`);
  } catch (err) {
    return next(err);
  }
}
