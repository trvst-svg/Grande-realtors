import { listInquiriesByProperty } from "../../models/inquiry.model.js";
import {
  getPropertyById,
  getSalesHandlerByPropertyId,
  updateProperty,
} from "../../models/property.model.js";
import { createTransaction } from "../../models/transaction.model.js";
import { createContract } from "../../models/contract.model.js";
import { getRoleIdByName, getUserById } from "../../models/user.model.js";
import buildContractText from "../../utils/buildContractText.js";

export default async function completePropertySaleHandler(req, res, next) {
  try {
    const propertyId = Number(req.params.id);
    const buyerId = Number(req.body?.buyer_id);
    const amount = Number(req.body?.amount);
    const paymentMethod = String(req.body?.payment_method || "inquiry").trim();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!propertyId || !buyerId || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Property, buyer, and amount are required" });
    }

    const property = await getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    if (String(property.sale_status || "").toLowerCase() === "sold") {
      return res.status(409).json({ error: "Property is already marked as sold" });
    }

    const adminRoleId = await getRoleIdByName("admin");
    const agentRoleId = await getRoleIdByName("agent");
    const salesHandler = await getSalesHandlerByPropertyId(propertyId);
    const isOwner = property.owner_id === userId;
    const isAdmin = req.user?.role_id === adminRoleId;
    const isAssignedAgent = req.user?.role_id === agentRoleId && salesHandler?.id === userId;

    if (!isOwner && !isAdmin && !isAssignedAgent) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const inquiries = await listInquiriesByProperty(propertyId);
    const matchedInquiry = inquiries.find((item) => item.user_id === buyerId);
    if (!matchedInquiry) {
      return res.status(400).json({ error: "Buyer must have an inquiry on this property" });
    }

    const buyer = await getUserById(buyerId);
    if (!buyer || buyer.id === property.owner_id) {
      return res.status(400).json({ error: "Invalid buyer selected" });
    }

    const transaction = await createTransaction({
      property_id: propertyId,
      buyer_id: buyerId,
      seller_id: property.owner_id,
      handler_id: salesHandler?.id || null,
      amount,
      payment_method: paymentMethod || "inquiry",
    });

    // Direct sales need the same legal artifact as accepted auction sales.
    const contractText = buildContractText({
      buyer,
      seller: await getUserById(property.owner_id),
      property,
      bid: { bid_amount: amount },
      createdAt: new Date(),
    });

    await createContract({
      bid_id: null,
      property_id: propertyId,
      buyer_id: buyerId,
      seller_id: property.owner_id,
      transaction_id: transaction?.id,
      contract_text: contractText,
    });

    await updateProperty(propertyId, {
      sale_status: "sold",
      listing_purpose: "sale",
    });

    return res.status(201).json({
      message: "Property marked as sold.",
      transaction,
    });
  } catch (err) {
    return next(err);
  }
}
