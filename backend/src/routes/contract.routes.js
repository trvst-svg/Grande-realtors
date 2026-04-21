import { Router } from "express";
import {
  getContractByBidHandler,
  getContractByTransactionHandler,
} from "../controllers/contract.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/bid/:bidId", getContractByBidHandler);
router.get("/transaction/:transactionId", getContractByTransactionHandler);

export default router;
