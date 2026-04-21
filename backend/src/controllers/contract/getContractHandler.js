import {
  getContractByBid,
  getContractByTransaction,
} from "../../models/contract.model.js";
import {
  buildContractTextEn,
  buildContractTextNe,
} from "../../utils/buildContractText.js";

function buildContractPayload(contract) {
  return {
    buyer: {
      firstname: contract.buyer_firstname,
      lastname: contract.buyer_lastname,
      email: contract.buyer_email,
    },
    seller: {
      firstname: contract.seller_firstname,
      lastname: contract.seller_lastname,
      email: contract.seller_email,
    },
    property: {
      location: contract.location,
      property_type: contract.property_type,
      listing_type: contract.listing_type,
    },
    bid: {
      bid_amount: contract.bid_amount,
    },
    createdAt: contract.created_at,
  };
}

function buildContractResponse(contract) {
  const payload = buildContractPayload(contract);
  return {
    ...contract,
    contract_texts: {
      en: buildContractTextEn(payload),
      ne: buildContractTextNe(payload),
    },
  };
}

function isAuthorizedContractViewer(contract, userId) {
  return [contract.buyer_id, contract.seller_id].includes(userId);
}

export async function getContractByBidHandler(req, res, next) {
  try {
    const bidId = Number(req.params.bidId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!bidId) {
      return res.status(400).json({ error: "Bid id is required" });
    }

    const contract = await getContractByBid(bidId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    if (!isAuthorizedContractViewer(contract, userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({
      contract: buildContractResponse(contract),
    });
  } catch (err) {
    return next(err);
  }
}

export async function getContractByTransactionHandler(req, res, next) {
  try {
    const transactionId = Number(req.params.transactionId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!transactionId) {
      return res.status(400).json({ error: "Transaction id is required" });
    }

    const contract = await getContractByTransaction(transactionId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }
    if (!isAuthorizedContractViewer(contract, userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({
      contract: buildContractResponse(contract),
    });
  } catch (err) {
    return next(err);
  }
}
