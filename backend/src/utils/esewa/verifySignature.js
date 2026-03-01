import buildEsewaSignaturePayload from "./buildSignaturePayload.js";
import generateEsewaSignature from "./generateSignature.js";

export default function verifyEsewaSignature(data, secret) {
  const signedFieldNames = data?.signed_field_names;
  const signature = data?.signature;
  if (!signedFieldNames || !signature) {
    return false;
  }

  const payload = buildEsewaSignaturePayload(data, signedFieldNames);
  const expected = generateEsewaSignature(payload, secret);
  return expected === signature;
}
