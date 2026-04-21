import { Router } from "express";
import {
  createInquiryMessageHandler,
  getInquiryThreadHandler,
  listMessageThreadsHandler,
} from "../controllers/message.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/threads", listMessageThreadsHandler);
router.get("/inquiries/:id", getInquiryThreadHandler);
router.post("/inquiries/:id", createInquiryMessageHandler);

export default router;
