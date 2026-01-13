import { Router } from "express";
import {
  createPropertyHandler,
  addPropertyImagesHandler,
  deletePropertyHandler,
  getPropertyHandler,
  listPropertiesHandler,
  listPropertiesByTypeHandler,
  searchPropertiesHandler,
  updatePropertyHandler,
} from "../controllers/property.controller.js";
import { uploadPropertyImages } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", listPropertiesHandler);
router.get("/search", searchPropertiesHandler);
router.get("/type/:type", listPropertiesByTypeHandler);
router.post("/", createPropertyHandler);
router.get("/:id", getPropertyHandler);
router.post(
  "/:id/images",
  uploadPropertyImages.array("images", 10),
  addPropertyImagesHandler
);
router.put("/:id", updatePropertyHandler);
router.delete("/:id", deletePropertyHandler);

export default router;
