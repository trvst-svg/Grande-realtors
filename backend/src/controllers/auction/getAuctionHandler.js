import { getAuctionById } from "../../models/auction.model.js";
import {
  getHouseDetailsByPropertyId,
  getLandDetailsByPropertyId,
} from "../../models/property.model.js";

export default async function getAuctionHandler(req, res, next) {
  try {
    const auction = await getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    let details = null;
    if (auction.property_type === "house") {
      details = await getHouseDetailsByPropertyId(auction.property_id);
    } else if (auction.property_type === "land") {
      details = await getLandDetailsByPropertyId(auction.property_id);
    }

    res.json({ ...auction, details });
  } catch (err) {
    next(err);
  }
}
