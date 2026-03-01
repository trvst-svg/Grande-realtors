export default function decodeEsewaResponse(base64Data) {
  const normalized = String(base64Data).replace(/ /g, "+");
  const decoded = Buffer.from(normalized, "base64").toString("utf-8");
  return JSON.parse(decoded);
}
