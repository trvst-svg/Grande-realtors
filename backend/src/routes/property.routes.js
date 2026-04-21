import { Router } from "express";
import {
  createPropertyHandler,
  createInquiryHandler,
  addFavoriteHandler,
  removeFavoriteHandler,
  getFavoriteStatusHandler,
  addPropertyImagesHandler,
  completePropertySaleHandler,
  deletePropertyHandler,
  getPropertyHandler,
  listPropertyInquiriesHandler,
  listPropertiesHandler,
  listPropertiesByTypeHandler,
  searchPropertiesHandler,
  updatePropertyHandler,
} from "../controllers/property.controller.js";
import { uploadPropertyImages } from "../middleware/upload.middleware.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listPropertiesHandler);
router.get("/search", searchPropertiesHandler);
router.get("/type/:type", listPropertiesByTypeHandler);
router.post("/", requireAuth, createPropertyHandler);
router.get("/:id/inquiries", requireAuth, listPropertyInquiriesHandler);
router.post("/:id/complete-sale", requireAuth, completePropertySaleHandler);
router.get("/:id", optionalAuth, getPropertyHandler);
router.post("/:id/inquiries", requireAuth, createInquiryHandler);
router.get("/:id/favorite", requireAuth, getFavoriteStatusHandler);
router.post("/:id/favorite", requireAuth, addFavoriteHandler);
router.delete("/:id/favorite", requireAuth, removeFavoriteHandler);
router.post(
  "/:id/images",
  requireAuth,
  uploadPropertyImages.array("images", 10),
  addPropertyImagesHandler
);
router.put("/:id", requireAuth, updatePropertyHandler);
router.delete("/:id", requireAuth, deletePropertyHandler);

export default router;
