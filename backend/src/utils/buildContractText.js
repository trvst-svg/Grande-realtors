function formatCurrency(amount, locale) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat(locale).format(value);
}

function formatCurrencyNe(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("ne-NP-u-nu-deva").format(value);
}

function formatDate(value, locale) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return locale === "ne-NP" ? "उपलब्ध छैन" : "N/A";
  }
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function translatePropertyTypeNe(propertyType) {
  const normalized = String(propertyType || "").trim().toLowerCase();
  if (normalized === "house") return "घर";
  if (normalized === "land") return "जग्गा";
  return propertyType || "सम्पत्ति";
}

function resolveTermsLabel(listingType) {
  return listingType ? `${listingType}` : "Direct Sale";
}

export function buildContractTextEn({ buyer, seller, property, bid, createdAt }) {
  const contractDate = formatDate(createdAt, "en-US");
  return `
REAL ESTATE SALE AGREEMENT

Date: ${contractDate}

Seller: ${seller ? `${seller.firstname} ${seller.lastname} (${seller.email})` : "N/A"}
Buyer: ${buyer ? `${buyer.firstname} ${buyer.lastname} (${buyer.email})` : "N/A"}

Property:
- Location: ${property.location}
- Type: ${property.property_type}
- Listing Type: ${resolveTermsLabel(property.listing_type)}

Agreed Price: NPR ${formatCurrency(bid.bid_amount, "en-US")}

Terms:
1. Buyer agrees to purchase the property described above at the agreed price.
2. Seller confirms ownership of the property and agrees to transfer it upon payment.
3. Both parties acknowledge that this digitally generated agreement records the accepted sale terms.

Signatures:
Seller: ______________________
Buyer:  ______________________
`;
}

export function buildContractTextNe({ buyer, seller, property, bid, createdAt }) {
  const contractDate = formatDate(createdAt, "ne-NP");
  const propertyTypeNe = translatePropertyTypeNe(property.property_type);
  return `
घरजग्गा बिक्री सम्झौता

मिति: ${contractDate}

बिक्रेता: ${seller.firstname} ${seller.lastname} (${seller.email})
क्रेता: ${buyer.firstname} ${buyer.lastname} (${buyer.email})

सम्पत्ति विवरण:
- स्थान: ${property.location}
- प्रकार: ${propertyTypeNe}
- सूचीकरण प्रकार: ${property.listing_type || "प्रत्यक्ष बिक्री"}

सहमति मूल्य: रु ${formatCurrencyNe(bid.bid_amount)}

शर्तहरू:
1. क्रेताले माथि उल्लिखित सम्पत्ति सहमति गरिएको मूल्यमा खरिद गर्न मञ्जुर गर्दछ।
2. बिक्रेताले उक्त सम्पत्तिको स्वामित्व पुष्टि गर्दै भुक्तानी पश्चात हस्तान्तरण गर्न मञ्जुर गर्दछ।
3. दुबै पक्षले यो डिजिटल सम्झौतामा उल्लेख गरिएका बिक्री शर्तहरू बाध्यकारी हुने कुरा स्वीकार गर्दछन्।

हस्ताक्षर:
बिक्रेता: ______________________
क्रेता:   ______________________
`;
}

export default function buildContractText(payload) {
  return buildContractTextEn(payload);
}
