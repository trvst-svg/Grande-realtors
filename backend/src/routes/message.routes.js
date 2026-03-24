import { Router } from "express";
import {
  listMessageThreadsHandler,
  listMessagesHandler,
  sendMessageHandler,
} from "../controllers/message.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/threads", listMessageThreadsHandler);
router.get("/thread", listMessagesHandler);
router.post("/", sendMessageHandler);

export default router;
