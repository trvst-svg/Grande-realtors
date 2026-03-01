import { markBidTicketFailed } from "../../models/payment.model.js";
import decodeEsewaResponse from "../../utils/esewa/decodeResponse.js";

function getFrontendBaseUrl(req) {
  const envUrl = process.env.FRONTEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const origin = req.headers.origin;
  if (origin) return origin;
  return "http://localhost:5173";
}

export default async function handleEsewaFailure(req, res, next) {
  try {
    const dataParam = req.body?.data || req.query?.data;
    let redirectPath = "/bidding?payment=failed";
    if (dataParam) {
      try {
        const payload = decodeEsewaResponse(dataParam);
        if (payload?.transaction_uuid) {
          const ticket = await markBidTicketFailed(payload.transaction_uuid);
          if (ticket?.auction_id) {
            redirectPath = `/bidding/${ticket.auction_id}?payment=failed`;
          }
        }
      } catch {
        // ignore decode failures
      }
    }

    const frontendBase = getFrontendBaseUrl(req);
    return res.redirect(`${frontendBase}${redirectPath}`);
  } catch (err) {
    next(err);
  }
}
