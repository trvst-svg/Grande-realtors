import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, fetchHomeData, fetchProperties } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./home.css";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([fetchHomeData(), fetchProperties()])
      .then(([homeResult, propertyResult]) => {
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
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
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
      <Navbar showProfile profileInitials={data.profile?.initials || "GR"} />

      <section className="home-section">
        <div className="section-head">
          <div>
            <h1>{data.browse.title}</h1>
            <p>{data.browse.subtitle}</p>
          </div>
        </div>
        <div className="browse-grid">
          {data.browse.cards.map((card) => (
            <article key={card.title} className="browse-card">
              <div className="browse-icon" />
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
              <span>{card.count}</span>
            </article>
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
