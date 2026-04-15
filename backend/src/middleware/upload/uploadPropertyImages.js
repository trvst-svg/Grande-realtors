import path from "path";
import multer from "multer";
import createStorage from "./createStorage.js";
import fileFilter from "./fileFilter.js";

const uploadPropertyImages = multer({
  storage: createStorage(path.resolve("propertyuploads")),
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export default uploadPropertyImages;
