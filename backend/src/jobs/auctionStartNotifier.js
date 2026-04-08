import pool from "../config/db.js";
import { updateAuctionStatus } from "../models/auction.model.js";
import { sendAuctionStartEmail } from "../utils/mailer.js";

const DEFAULT_INTERVAL_MS = 60 * 1000;

export default function startAuctionStartNotifier() {
  const intervalMs = Number(process.env.AUCTION_START_POLL_MS || DEFAULT_INTERVAL_MS);
  let running = false;

  const run = async () => {
    // Prevent overlapping scans when one poll takes longer than the interval.
    if (running) return;
    running = true;
    try {
      const auctionsResult = await pool.query(
        `SELECT a.id,
                a.start_time,
                a.end_time,
                a.property_id,
                p.location,
                pt.name AS property_type
         FROM auctions a
         JOIN properties p ON p.id = a.property_id
         JOIN property_types pt ON pt.id = p.property_type_id
         WHERE a.status = 'scheduled'
           AND a.start_time IS NOT NULL
           AND a.start_time <= NOW()`
      );

      for (const auction of auctionsResult.rows) {
        await updateAuctionStatus(auction.id, "open");

        const tickets = await pool.query(
          `SELECT u.email, u.firstname, u.lastname
           FROM bid_tickets bt
           JOIN users u ON u.id = bt.user_id
           WHERE bt.auction_id = $1
             AND bt.status = 'paid'`,
          [auction.id]
        );

        if (!tickets.rows.length) continue;

        const frontendBase =
          process.env.FRONTEND_URL || "http://localhost:5173";
        for (const user of tickets.rows) {
          if (!user.email) continue;
          try {
            await sendAuctionStartEmail({
              to: user.email,
              name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
              auction,
              frontendBase,
            });
          } catch (error) {
            if (error.code !== "MAIL_NOT_CONFIGURED") {
              console.error("Failed to send auction start email", error);
            }
          }
        }
      }
    } catch (err) {
      console.error("Auction start notifier error", err);
    } finally {
      running = false;
    }
  };

  // Run once on boot so scheduled auctions do not wait for the first interval tick.
  run();
  setInterval(run, intervalMs);
}
