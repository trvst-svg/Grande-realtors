import { Router } from "express";
import {
  createPropertyHandler,
  createPropertyInquiryHandler,
  addPropertyImagesHandler,
  deletePropertyHandler,
  getPropertyHandler,
  listPropertiesHandler,
  listPropertiesByTypeHandler,
  searchPropertiesHandler,
  updatePropertyHandler,
} from "../controllers/property.controller.js";
import { uploadPropertyImages } from "../middleware/upload.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listPropertiesHandler);
router.get("/search", searchPropertiesHandler);
router.get("/type/:type", listPropertiesByTypeHandler);
router.post("/", requireAuth, createPropertyHandler);
router.get("/:id", getPropertyHandler);
router.post("/:id/inquiry", requireAuth, createPropertyInquiryHandler);
router.post(
  "/:id/images",
  requireAuth,
  uploadPropertyImages.array("images", 10),
  addPropertyImagesHandler
);
router.put("/:id", requireAuth, updatePropertyHandler);
router.delete("/:id", requireAuth, deletePropertyHandler);

export default router;
