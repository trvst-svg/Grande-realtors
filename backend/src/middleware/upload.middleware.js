import fs from "fs";
import path from "path";
import multer from "multer";

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createStorage(uploadDir) {
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

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
};

export const uploadCitizenship = multer({
  storage: createStorage(path.resolve("useruploads")),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadPropertyImages = multer({
  storage: createStorage(path.resolve("propertyuploads")),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
