import auctionEvents from "../../events/auctionEvents.js";

export default async function streamAuctionHandler(req, res, next) {
  try {
    const auctionId = Number(req.params.id);
    if (!auctionId) {
      return res.status(400).json({ error: "Auction id is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const send = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const onBid = (payload) => {
      if (payload?.auctionId !== auctionId) return;
      send("bid", payload);
    };

    auctionEvents.on("bid:created", onBid);

    const heartbeat = setInterval(() => {
      res.write("event: ping\n");
      res.write(`data: ${Date.now()}\n\n`);
    }, 25000);

    req.on("close", () => {
      clearInterval(heartbeat);
      auctionEvents.off("bid:created", onBid);
    });
  } catch (err) {
    next(err);
  }
}
