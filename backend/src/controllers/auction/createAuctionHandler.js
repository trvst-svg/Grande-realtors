import { createAuction, getAuctionByPropertyId } from "../../models/auction.model.js";
import { getPropertyWithVerification } from "../../models/property.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function createAuctionHandler(req, res, next) {
  try {
    const { property_id, start_time, end_time, starting_price, status } =
      req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }

    if (!property_id || !starting_price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const property = await getPropertyWithVerification(property_id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const adminRoleId = await getRoleIdByName("admin");
    const agentRoleId = await getRoleIdByName("agent");
    if (!adminRoleId || !agentRoleId) {
      return res.status(500).json({ error: "Roles not configured" });
    }
    const isOwner = property.owner_id === userId;
    const isPrivileged =
      req.user?.role_id === adminRoleId || req.user?.role_id === agentRoleId;
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (
      property.request_status &&
      property.request_status !== "approved"
    ) {
      return res
        .status(403)
        .json({ error: "Property must be approved before auction" });
    }

    if (property.sale_status && property.sale_status !== "available") {
      return res
        .status(400)
        .json({ error: "Property is not available for auction" });
    }

    const startingValue = Number(starting_price);
    if (!Number.isFinite(startingValue) || startingValue <= 0) {
      return res
        .status(400)
        .json({ error: "Starting price must be a positive number" });
    }

    if (start_time && end_time) {
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid auction dates" });
      }
      if (endDate <= startDate) {
        return res
          .status(400)
          .json({ error: "End time must be after start time" });
      }
    }

    const existing = await getAuctionByPropertyId(property.id);
    if (existing) {
      return res.status(409).json({ error: "Auction already exists" });
    }

    const auction = await createAuction({
      property_id: property.id,
      start_time: start_time || null,
      end_time: end_time || null,
      starting_price: startingValue,
      status,
    });

    res.status(201).json({ message: "Auction created", auction });
  } catch (err) {
    next(err);
  }
}
