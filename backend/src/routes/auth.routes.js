import { Router } from "express";
import { login, signup } from "../controllers/auth.controller.js";
import { uploadCitizenship } from "../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/signup",
  uploadCitizenship.fields([
    { name: "citizenshipFront", maxCount: 1 },
    { name: "citizenshipBack", maxCount: 1 },
  ]),
  signup
);
router.post("/login", login);

export default router;
