import createTransporter from "./createTransporter.js";

let cachedTransporter = null;

export default function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const transporter = createTransporter();
  if (!transporter) return null;
  cachedTransporter = transporter;
  return cachedTransporter;
}
