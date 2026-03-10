import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { API_BASE_URL, fetchLandingData, fetchProperties } from "./api.js";
import "./landing.css";

const sliderImages = [
  // Add your image URLs here, for example:
  // "/images/slide-1.jpg",
  // "/images/slide-2.jpg",
  // "/images/slide-3.jpg",
];

const FALLBACK_FOOTER = {
  about:
    "Grande Realtors is Nepal's premier platform for transparent real estate and verified listings.",
  quickLinks: ["Home", "About", "Services", "Blog", "Contact"],
  categories: ["Houses", "Apartments", "Lands", "Auctions"],
  contact: ["Kathmandu, Nepal", "+977 9812345678", "info@granderealtors.com"],
};

const MAX_SNIPPETS = 3;

export default function LandingPage() {
  const [footer, setFooter] = useState(FALLBACK_FOOTER);
  const [houses, setHouses] = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetchLandingData()
      .then((payload) => {
        if (!mounted || !payload?.footer) return;
        const incoming = payload.footer;
        setFooter({
          ...FALLBACK_FOOTER,
          ...incoming,
          quickLinks: incoming.quickLinks ?? FALLBACK_FOOTER.quickLinks,
          categories: incoming.categories ?? FALLBACK_FOOTER.categories,
          contact: incoming.contact ?? FALLBACK_FOOTER.contact,
        });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([fetchProperties("house"), fetchProperties("land")])
      .then(([housesResult, landsResult]) => {
        if (!mounted) return;
        setHouses(housesResult.status === "fulfilled" ? housesResult.value : []);
        setLands(landsResult.status === "fulfilled" ? landsResult.value : []);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setHouses([]);
          setLands([]);
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

  const slides = sliderImages.length ? sliderImages : [null];
  const houseSnippets = houses.slice(0, MAX_SNIPPETS);
  const landSnippets = lands.slice(0, MAX_SNIPPETS);

  return (
    <div className="landing">
      <Navbar showAuthActions />

      <section className="landing-slider" aria-label="Featured property slider">
        <div className="slider-shell">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {slides.map((src, index) => (
              <div
                key={src || index}
                className={`slide${src ? "" : " placeholder"}`}
              >
                {src ? (
                  <img src={src} alt={`Featured property ${index + 1}`} />
                ) : (
                  <div className="slide-placeholder">
                    <p>Add your sliding images here</p>
                    <span>Update the `sliderImages` array in landing.jsx.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {sliderImages.length > 1 ? (
          <div className="slider-dots">
            {sliderImages.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={`slider-dot${index === slideIndex ? " active" : ""}`}
                onClick={() => setSlideIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="snippet-section">
        <div className="snippet-head">
          <div>
            <span className="eyebrow">HOUSES</span>
            <h2>Latest Houses</h2>
            <p>Explore the newest home listings from Grande Realtors.</p>
          </div>
          <Link className="text-link" to="/houses">
            View all houses
          </Link>
        </div>
        {loading ? (
          <div className="snippet-loading">Loading house listings...</div>
        ) : houseSnippets.length ? (
          <div className="snippet-grid">
            {houseSnippets.map((item) => (
              <article key={item.id} className="snippet-card">
                <div className="snippet-media">
                  <span className="snippet-tag">
                    {item.sale_status || "Available"}
                  </span>
                  {item.image ? (
                    <img
                      src={`${API_BASE_URL}${item.image}`}
                      alt={item.title || item.property_type || "House listing"}
                    />
                  ) : (
                    <div className="media-placeholder" />
                  )}
                </div>
                <div className="snippet-body">
                  <p className="price">
                    {item.price ? `NPR ${item.price}` : "Price on request"}
                  </p>
                  <h3>{item.title || item.property_type || "House listing"}</h3>
                  <p className="location">{item.location || "Nepal"}</p>
                  <p className="meta">
                    {item.description || item.listing_type || "House listing"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="snippet-empty">No house listings yet.</div>
        )}
      </section>

      <section className="snippet-section">
        <div className="snippet-head">
          <div>
            <span className="eyebrow">LANDS</span>
            <h2>Latest Lands</h2>
            <p>Browse land opportunities ready for your next project.</p>
          </div>
          <Link className="text-link" to="/lands">
            View all lands
          </Link>
        </div>
        {loading ? (
          <div className="snippet-loading">Loading land listings...</div>
        ) : landSnippets.length ? (
          <div className="snippet-grid">
            {landSnippets.map((item) => (
              <article key={item.id} className="snippet-card">
                <div className="snippet-media">
                  <span className="snippet-tag">
                    {item.sale_status || "Available"}
                  </span>
                  {item.image ? (
                    <img
                      src={`${API_BASE_URL}${item.image}`}
                      alt={item.title || item.property_type || "Land listing"}
                    />
                  ) : (
                    <div className="media-placeholder" />
                  )}
                </div>
                <div className="snippet-body">
                  <p className="price">
                    {item.price ? `NPR ${item.price}` : "Price on request"}
                  </p>
                  <h3>{item.title || item.property_type || "Land listing"}</h3>
                  <p className="location">{item.location || "Nepal"}</p>
                  <p className="meta">
                    {item.description || item.listing_type || "Land listing"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="snippet-empty">No land listings yet.</div>
        )}
      </section>

      <footer className="landing-footer">
        <div>
          <h3>Grande Realtors</h3>
          <p>{footer.about}</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          {(footer.quickLinks || []).map((item) => {
            const label = item.toLowerCase();
            const routeMap = {
              home: "/home",
              about: "/contact",
              services: "/contact",
              blog: "/contact",
              contact: "/contact",
            };
            const route = routeMap[label];
            return route ? (
              <Link key={item} to={route}>
                {item}
              </Link>
            ) : (
              <span key={item}>{item}</span>
            );
          })}
        </div>
        <div>
          <h4>Categories</h4>
          {(footer.categories || []).map((item) => {
            const label = item.toLowerCase();
            const routeMap = {
              houses: "/houses",
              apartments: "/houses",
              lands: "/lands",
              auctions: "/bidding",
            };
            const route = routeMap[label];
            return route ? (
              <Link key={item} to={route}>
                {item}
              </Link>
            ) : (
              <span key={item}>{item}</span>
            );
          })}
        </div>
        <div>
          <h4>Contact</h4>
          {(footer.contact || []).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
