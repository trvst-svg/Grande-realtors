import {
  createAuction,
  createBid,
  getAuctionById,
  getHighestBid,
  listAuctions,
  listBidsByAuction,
  updateAuctionStatus,
} from "../models/auction.model.js";

export async function createAuctionHandler(req, res, next) {
  try {
    const { property_id, start_time, end_time, starting_price, status } =
      req.body;

    if (!property_id || !starting_price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const auction = await createAuction({
      property_id,
      start_time,
      end_time,
      starting_price,
      status,
    });

    res.status(201).json({ message: "Auction created", auction });
  } catch (err) {
    next(err);
  }
}

export async function listAuctionsHandler(_req, res, next) {
  try {
    const items = await listAuctions();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function getAuctionHandler(req, res, next) {
  try {
    const auction = await getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (err) {
    next(err);
  }
}

export async function createBidHandler(req, res, next) {
  try {
    const { user_id, bid_amount } = req.body;
    const auction = await getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    if (auction.status !== "open") {
      return res.status(400).json({ error: "Auction is not open" });
    }
    if (!user_id || !bid_amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const highestBid = await getHighestBid(auction.id);
    const current = Number(highestBid || auction.starting_price);
    if (Number(bid_amount) <= current) {
      return res.status(400).json({ error: "Bid must be higher than current" });
    }

    const bid = await createBid({
      auction_id: auction.id,
      user_id,
      bid_amount,
    });

    res.status(201).json({ message: "Bid placed", bid });
  } catch (err) {
    next(err);
  }
}

export async function listBidsHandler(req, res, next) {
  try {
    const items = await listBidsByAuction(req.params.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function updateAuctionStatusHandler(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const auction = await updateAuctionStatus(req.params.id, status);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json({ message: "Auction updated", auction });
  } catch (err) {
    next(err);
  }
}
