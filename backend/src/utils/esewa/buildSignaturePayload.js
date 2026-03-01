export default function buildEsewaSignaturePayload(data, signedFieldNames) {
  return signedFieldNames
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean)
    .map((field) => `${field}=${data[field] ?? ""}`)
    .join(",");
}
