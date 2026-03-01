import crypto from "crypto";

export default function generateEsewaSignature(payload, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("base64");
}
