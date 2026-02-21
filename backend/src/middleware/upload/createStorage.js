import multer from "multer";
import ensureDir from "./ensureDir.js";

export default function createStorage(uploadDir) {
  ensureDir(uploadDir);
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}-${safeName}`);
    },
  });
}
