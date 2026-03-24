import { Router } from "express";
import {
  login,
  signup,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";
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
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/password/forgot", requestPasswordReset);
router.post("/password/reset", resetPassword);

export default router;
