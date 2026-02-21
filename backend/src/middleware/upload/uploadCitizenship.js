import path from "path";
import multer from "multer";
import createStorage from "./createStorage.js";
import fileFilter from "./fileFilter.js";

const uploadCitizenship = multer({
  storage: createStorage(path.resolve("useruploads")),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadCitizenship;
