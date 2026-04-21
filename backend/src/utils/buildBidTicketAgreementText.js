function formatCurrencyNe(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("ne-NP-u-nu-deva").format(value);
}

function translatePropertyTypeNe(propertyType) {
  const normalized = String(propertyType || "").trim().toLowerCase();
  if (normalized === "house") return "घर";
  if (normalized === "land") return "जग्गा";
  return propertyType || "सम्पत्ति";
}

export function buildBidTicketAgreementTextEn({
  userName,
  propertyType,
  propertyLocation,
  startingPrice,
}) {
  return `Grande Realtors Bid Participation Agreement

I, ${userName}, agree that by purchasing a bid ticket for the ${propertyType} auction at ${propertyLocation}, I am entering a legally binding commitment to honor any winning bid I place.

I understand that:
1. Any bid submitted by me is intentional and enforceable.
2. If I become the winning bidder, I shall complete payment for the amount I bid within the process required by Grande Realtors.
3. Failure to honor a winning bid may result in cancellation of my bidding privileges, financial penalties, legal claims, and recovery proceedings as permitted by law.
4. This agreement is recorded electronically and may be used as evidence of my acceptance.

Auction starting price: NPR ${startingPrice}

By proceeding to purchase the bid ticket, I confirm that I have read, understood, and accepted these terms voluntarily.`;
}

export function buildBidTicketAgreementTextNe({
  userName,
  propertyType,
  propertyLocation,
  startingPrice,
}) {
  const propertyTypeNe = translatePropertyTypeNe(propertyType);
  return `Grande Realtors बोलपत्र सहभागिता सम्झौता

म, ${userName}, ${propertyLocation} मा रहेको ${propertyTypeNe} लिलामका लागि बोलपत्र टिकट खरिद गरेर मैले राख्ने कुनै पनि विजयी बोलपत्र सम्मान गर्ने कानुनी रूपमा बाध्यकारी प्रतिबद्धतामा प्रवेश गरिरहेको छु भन्ने कुरामा सहमत छु।

म बुझ्दछु कि:
1. मैले पेश गरेको कुनै पनि बोलपत्र जानाजानी गरिएको र कार्यान्वयनयोग्य हुनेछ।
2. यदि म विजयी बोलपत्रदाता भएँ भने, मैले Grande Realtors ले तोकेको प्रक्रियाअनुसार मैले प्रस्ताव गरेको पूर्ण रकम भुक्तानी गर्नुपर्छ।
3. विजयी बोलपत्र पूरा नगरेमा मेरो बोलपत्र अधिकार रद्द हुन सक्छ, आर्थिक जरिवाना, कानुनी दाबी, तथा कानुनले अनुमति दिएको वसूली प्रक्रिया हुन सक्छ।
4. यो सम्झौता विद्युतीय रूपमा अभिलेख राखिनेछ र मेरो स्वीकृतिको प्रमाणका रूपमा प्रयोग गर्न सकिनेछ।

लिलामको प्रारम्भिक मूल्य: रु ${formatCurrencyNe(startingPrice)}

बोलपत्र टिकट खरिद प्रक्रियामा अघि बढेर, मैले यी सर्तहरू पढेको, बुझेको र स्वेच्छाले स्वीकार गरेको पुष्टि गर्दछु।`;
}

export default function buildBidTicketAgreementText(payload) {
  return buildBidTicketAgreementTextEn(payload);
}
