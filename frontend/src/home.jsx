import { useEffect, useState } from "react";
import { fetchHomeData, fetchProperties } from "./api.js";
import "./home.css";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchHomeData(), fetchProperties()])
      .then(([homePayload, propertyItems]) => {
        if (mounted) {
          setData(homePayload);
          setProperties(propertyItems);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="home-loading">
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <header className="home-header">
        <div className="brand">{data.brand}</div>
        <nav>
          {data.nav.map((item) => (
            <a key={item} href="#">
              {item}
            </a>
          ))}
        </nav>
        <div className="profile-chip">{data.profile.initials}</div>
      </header>

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
          <button className="text-link">{data.featured.action}</button>
        </div>
        <div className="featured-grid">
          {(properties.length ? properties.slice(0, 8) : data.featured.items).map(
            (item) => (
              <article key={item.id} className="home-card">
                <div className="card-media">
                  <span className="badge">{item.badge || "Featured"}</span>
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
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
            )
          )}
        </div>
      </section>
    </div>
  );
}
