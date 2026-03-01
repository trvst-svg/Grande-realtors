import { getAuctionById } from "../../models/auction.model.js";
import {
  getBidTicketByUserAuction,
  upsertBidTicket,
} from "../../models/payment.model.js";
import buildEsewaSignaturePayload from "../../utils/esewa/buildSignaturePayload.js";
import generateEsewaSignature from "../../utils/esewa/generateSignature.js";

const TICKET_AMOUNT = Number(process.env.BID_TICKET_AMOUNT || 1000);
const SIGNED_FIELDS = "total_amount,transaction_uuid,product_code";

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

    if (!auctionId) {
      return res.status(400).json({ error: "Auction id is required" });
    }

    const auction = await getAuctionById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    if (auction.status !== "open") {
      return res.status(400).json({ error: "Auction is not open" });
    }

    const existing = await getBidTicketByUserAuction(auctionId, userId);
    if (existing && existing.status === "paid") {
      return res.json({ status: "paid", amount: existing.amount });
    }

    const transactionUuid = `bid-${auctionId}-${userId}-${Date.now()}`;
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    const gatewayUrl =
      process.env.ESEWA_GATEWAY_URL ||
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    const backendBase = getBackendBaseUrl(req);
    const successUrl =
      process.env.ESEWA_SUCCESS_URL ||
      `${backendBase}/api/payments/esewa/success`;
    const failureUrl =
      process.env.ESEWA_FAILURE_URL ||
      `${backendBase}/api/payments/esewa/failure`;

    const totalAmount = Number.isFinite(TICKET_AMOUNT) ? TICKET_AMOUNT : 1000;
    const signaturePayload = buildEsewaSignaturePayload(
      {
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
      },
      SIGNED_FIELDS
    );
    const signature = generateEsewaSignature(signaturePayload, secretKey);

    const ticket = await upsertBidTicket({
      auctionId,
      userId,
      transactionUuid,
      amount: totalAmount,
      status: "pending",
    });

    return res.json({
      status: ticket.status,
      amount: ticket.amount,
      payment: {
        gatewayUrl,
        fields: {
          amount: totalAmount,
          tax_amount: 0,
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: productCode,
          product_service_charge: 0,
          product_delivery_charge: 0,
          success_url: successUrl,
          failure_url: failureUrl,
          signed_field_names: SIGNED_FIELDS,
          signature,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
