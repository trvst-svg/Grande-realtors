import { getAuctionById } from "../../models/auction.model.js";
import { getUserById } from "../../models/user.model.js";
import {
  buildBidTicketAgreementTextEn,
  buildBidTicketAgreementTextNe,
} from "../../utils/buildBidTicketAgreementText.js";

export default async function getBidTicketAgreementHandler(req, res, next) {
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

    const user = await getUserById(userId);
    const payload = {
      userName: user ? `${user.firstname} ${user.lastname}`.trim() : "Bidder",
      propertyType: auction.property_type || "property",
      propertyLocation: auction.location || "the listed property",
      startingPrice: auction.starting_price,
    };

    return res.json({
      agreement_text: buildBidTicketAgreementTextEn(payload),
      agreement_texts: {
        en: buildBidTicketAgreementTextEn(payload),
        ne: buildBidTicketAgreementTextNe(payload),
      },
    });
  } catch (err) {
    return next(err);
  }
}
