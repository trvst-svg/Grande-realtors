import {
  getBidTicketByTransaction,
  markBidTicketPaid,
} from "../../models/payment.model.js";
import decodeEsewaResponse from "../../utils/esewa/decodeResponse.js";
import verifyEsewaSignature from "../../utils/esewa/verifySignature.js";

function getFrontendBaseUrl(req) {
  const envUrl = process.env.FRONTEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const origin = req.headers.origin;
  if (origin) return origin;
  return "http://localhost:5173";
}

export default async function handleEsewaSuccess(req, res, next) {
  try {
    const dataParam = req.body?.data || req.query?.data;
    const frontendBase = getFrontendBaseUrl(req);

    if (!dataParam) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    let payload;
    try {
      payload = decodeEsewaResponse(dataParam);
    } catch (error) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";

    const isValid = verifyEsewaSignature(payload, secretKey);
    if (!isValid) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    if (payload.status !== "COMPLETE") {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    if (payload.product_code !== productCode) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    if (!payload.transaction_uuid) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    const ticket = await getBidTicketByTransaction(payload.transaction_uuid);
    if (!ticket) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    const totalAmount = Number(payload.total_amount);
    if (Number(ticket.amount) !== totalAmount) {
      return res.redirect(`${frontendBase}/bidding?payment=failed`);
    }

    if (ticket.status !== "paid") {
      await markBidTicketPaid({
        transactionUuid: payload.transaction_uuid,
        transactionCode: payload.transaction_code || null,
        amount: totalAmount,
      });
    }

    return res.redirect(
      `${frontendBase}/bidding/${ticket.auction_id}?payment=success`
    );
  } catch (err) {
    next(err);
  }
}
