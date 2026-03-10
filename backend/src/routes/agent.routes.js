import { Router } from "express";
import {
  listSalesHandlersHandler,
  getSalesHandlerProfileHandler,
} from "../controllers/agent.controller.js";

const router = Router();

router.get("/", listSalesHandlersHandler);
router.get("/:id", getSalesHandlerProfileHandler);

export default router;
