export function getLandingData(_req, res) {
  const data = {
    brand: "Grande.",
    nav: ["Home", "Lands", "Houses", "Bidding", "Contact"],
    hero: {
      label: "WELCOME TO GRANDE REALTORS",
      title: "Find Your Dream Property in Nepal",
      copy:
        "Discover prime lands, modern homes, and transparent auctions tailored to your journey to finding the perfect space with Grande Realtors.",
      cta: "Explore Properties",
    },
    benefits: {
      label: "WHY CHOOSE US",
      title: "Your Trusted Real Estate Partner",
      items: [
        {
          title: "Expert Guidance",
          copy: "Our experienced agents guide you through every step.",
        },
        {
          title: "Verified Properties",
          copy: "Every listing is screened for authenticity and quality.",
        },
        {
          title: "Transparent Process",
          copy: "Clear pricing and fair bids for complete confidence.",
        },
        {
          title: "Fast Transactions",
          copy: "Close deals quickly with our streamlined process.",
        },
        {
          title: "Premium Listings",
          copy: "Access exclusive homes and land opportunities.",
        },
        {
          title: "Dedicated Support",
          copy: "Our team stays with you before and after the sale.",
        },
      ],
    },
    featured: {
      label: "FEATURED",
      title: "Discover Premium Properties",
      items: [
        {
          id: 1,
          title: "Modern Villa in Budhanilkantha",
          price: "NPR 2.5 Cr",
          meta: "4 Beds • 3 Baths • 6,200 sq.ft",
          badge: "New",
        },
        {
          id: 2,
          title: "Luxury Apartment in Lazimpat",
          price: "NPR 1.8 Cr",
          meta: "3 Beds • 2 Baths • 2,100 sq.ft",
          badge: "Popular",
        },
        {
          id: 3,
          title: "Countryside Bungalow in Bhaktapur",
          price: "NPR 3.2 Cr",
          meta: "5 Beds • 4 Baths • 7,500 sq.ft",
          badge: "Featured",
        },
      ],
    },
    cta: {
      title: "Ready to Find Your Dream Home?",
      copy:
        "Join thousands of satisfied clients who found the perfect property with Grande Realtors.",
      button: "Get Started",
    },
    footer: {
      about:
        "Grande Realtors is Nepal's premier platform for transparent real estate and verified listings.",
      quickLinks: ["Home", "About", "Services", "Blog", "Contact"],
      categories: ["Houses", "Apartments", "Lands", "Auctions"],
      contact: ["Kathmandu, Nepal", "+977 9812345678", "info@granderealtors.com"],
    },
  };

  res.json(data);
}
