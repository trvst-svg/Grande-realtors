import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  API_BASE_URL,
  fetchAuctions,
  fetchHomeData,
  fetchProperties,
} from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./home.css";

const sliderImages = [
  "/image1.png",
  "/image2.png",
  "/image3.png",
  "/image4.png",
  "/image5.png",
];

export default function HomePage() {
  const [data, setData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [lands, setLands] = useState([]);
  const [houses, setHouses] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      fetchHomeData(),
      fetchProperties(),
      fetchProperties("land"),
      fetchProperties("house"),
      fetchAuctions(),
    ]).then(([homeResult, propertyResult, landResult, houseResult, auctionResult]) => {
        if (!mounted) return;

        if (homeResult.status === "fulfilled") {
          setData(homeResult.value);
        } else {
          setError(
            homeResult.reason?.message || "Unable to load home data right now."
          );
        }

        if (propertyResult.status === "fulfilled") {
          setProperties(propertyResult.value);
        }

        if (landResult.status === "fulfilled") {
          setLands(landResult.value);
        }

        if (houseResult.status === "fulfilled") {
          setHouses(houseResult.value);
        }

        if (auctionResult.status === "fulfilled") {
          setAuctions(auctionResult.value);
        }
      }).finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const featuredItems = useMemo(() => {
    const items = properties.length ? properties.slice(0, 8) : data?.featured?.items || [];
    return items.map((item) => {
      const imageUrl = item.image ? `${API_BASE_URL}${item.image}` : null;
      const title = item.title || item.property_type || "Property";
      const location = item.location || "Nepal";
      const priceValue = item.price;
      const price =
        typeof priceValue === "number" || /^\d+(\.\d+)?$/.test(String(priceValue || ""))
          ? `NPR ${priceValue}`
          : priceValue || "NPR -";
      const meta = item.meta || item.description || "Verified listing";
      return { ...item, imageUrl, title, location, price, meta };
    });
  }, [data, properties]);

  const browseCards = useMemo(() => {
    const availableLands = lands.filter(
      (item) => !item.sale_status || item.sale_status === "available"
    ).length;
    const availableHouses = houses.filter(
      (item) => !item.sale_status || item.sale_status === "available"
    ).length;
    const liveAuctions = auctions.filter(
      (item) => !item.status || item.status === "open"
    ).length;

    return [
      {
        title: "Lands",
        copy: "Prime plots for your dream project",
        count: `${availableLands} Properties Available`,
        to: "/lands",
      },
      {
        title: "Houses",
        copy: "Beautiful homes ready to move in",
        count: `${availableHouses} Properties Available`,
        to: "/houses",
      },
      {
        title: "Live Auctions",
        copy: "Bid on exclusive properties",
        count: `${liveAuctions} Active Auctions`,
        to: "/bidding",
      },
    ];
  }, [auctions, houses, lands]);

  if (loading) {
    return (
      <div className="home-loading">
        <p>Loading properties...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="home-loading">
        <p>{error || "Unable to load home data."}</p>
      </div>
    );
  }

  return (
    <div className="home">
      <Navbar showAuthActions showProfile />

      <section className="home-slider" aria-label="Featured property slider">
        <div className="home-slider-shell">
          <div
            className="home-slider-track"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {sliderImages.map((src, index) => (
              <div key={src || index} className="home-slide">
                <img src={src} alt={`Featured property ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
        {sliderImages.length > 1 ? (
          <div className="home-slider-dots">
            {sliderImages.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={`home-slider-dot${index === slideIndex ? " active" : ""}`}
                onClick={() => setSlideIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="home-section">
        <div className="section-head">
          <div>
            <h1>{data.browse.title}</h1>
            <p>{data.browse.subtitle}</p>
          </div>
        </div>
        <div className="browse-grid">
          {browseCards.map((card) => (
            <Link key={card.title} to={card.to} className="browse-card-link">
              <article className="browse-card">
                <div className="browse-icon" />
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
                <span>{card.count}</span>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head row">
          <h2>{data.featured.title}</h2>
          <Link className="text-link" to="/lands">
            {data.featured.action}
          </Link>
        </div>
        <div className="featured-grid">
          {featuredItems.map((item) => (
            <article key={item.id} className="home-card">
              <div className="card-media">
                <span className="badge">{item.badge || "Featured"}</span>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div className="media-block" />
                )}
              </div>
              <div className="card-body">
                <p className="price">{item.price}</p>
                <h3>{item.title}</h3>
                <p className="location">{item.location}</p>
                <div className="meta">{item.meta}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
