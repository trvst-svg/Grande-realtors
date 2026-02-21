export default function getHomeData(_req, res) {
  const data = {
    brand: "Grande.",
    nav: ["Home", "Lands", "Houses", "Bidding", "Contact"],
    profile: { initials: "JD" },
    browse: {
      title: "Browse Properties",
      subtitle: "Discover your perfect property from our exclusive collection",
      cards: [
        {
          title: "Lands",
          copy: "Prime plots for your dream project",
          count: "156 Properties Available",
        },
        {
          title: "Houses",
          copy: "Beautiful homes ready to move in",
          count: "243 Properties Available",
        },
        {
          title: "Live Auctions",
          copy: "Bid on exclusive properties",
          count: "28 Active Auctions",
        },
      ],
    },
    featured: {
      title: "Featured Properties",
      action: "View All →",
      items: [
        {
          id: 1,
          price: "NPR 2.5 Cr",
          title: "Modern Villa",
          location: "Budhanilkantha, KTM",
          badge: "Featured",
          meta: "4 Beds • 3 Baths • 3200 sq.ft",
        },
        {
          id: 2,
          price: "NPR 1.2 Cr",
          title: "Prime Land Plot",
          location: "Imadol, Lalitpur",
          badge: "New",
          meta: "5 Aana • 18 ft Road • South",
        },
        {
          id: 3,
          price: "NPR 1.8 Cr",
          title: "Luxury Apartment",
          location: "Lazimpat, KTM",
          badge: "Hot",
          meta: "3 Beds • 2 Baths • 2400 sq.ft",
        },
        {
          id: 4,
          price: "NPR 3.2 Cr",
          title: "Executive Bungalow",
          location: "Bhainsepati, Lalitpur",
          badge: "Featured",
          meta: "5 Beds • 4 Baths • 4500 sq.ft",
        },
        {
          id: 5,
          price: "NPR 90 Lakh",
          title: "Residential Plot",
          location: "Lubhu, Lalitpur",
          badge: "New",
          meta: "3 Aana • 12 ft Road • North",
        },
        {
          id: 6,
          price: "NPR 2.1 Cr",
          title: "Garden House",
          location: "Nakhipot, Lalitpur",
          badge: "New",
          meta: "4 Beds • 3 Baths • 2800 sq.ft",
        },
        {
          id: 7,
          price: "NPR 2.8 Cr",
          title: "Commercial Land",
          location: "Satdobato, Lalitpur",
          badge: "Hot",
          meta: "8 Aana • 25 ft Road • East",
        },
        {
          id: 8,
          price: "NPR 1.6 Cr",
          title: "Modern Duplex",
          location: "Sanepa, Lalitpur",
          badge: "Featured",
          meta: "3 Beds • 2 Baths • 2200 sq.ft",
        },
      ],
    },
  };

  res.json(data);
}
