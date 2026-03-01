import { Router } from "express";
import {
  handleEsewaFailure,
  handleEsewaSuccess,
} from "../controllers/payment.controller.js";

const router = Router();

router.all("/esewa/success", handleEsewaSuccess);
router.all("/esewa/failure", handleEsewaFailure);

export default router;
