import { useEffect, useState } from "react";
import { fetchProperties } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./properties.css";

export default function LandsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({
    location: "",
    type: "All Types",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchProperties("land").then(setItems).catch(() => setItems([]));
  }, []);

  const filtered = items.filter((item) => {
    const matchLocation = filter.location
      ? item.location?.toLowerCase().includes(filter.location.toLowerCase())
      : true;
    const price = Number(item.price || 0);
    const matchMin = filter.minPrice ? price >= Number(filter.minPrice) : true;
    const matchMax = filter.maxPrice ? price <= Number(filter.maxPrice) : true;
    return matchLocation && matchMin && matchMax;
  });

  return (
    <div className="property-page">
      <Navbar showProfile />

      <section className="property-hero">
        <h1>Land Properties</h1>
        <p>Find the perfect land for your dream project</p>
      </section>

      <section className="filters">
        <h4>Search Filters</h4>
        <div className="filter-grid">
          <div>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              placeholder="e.g. Lalitpur"
              value={filter.location}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, location: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="type">Land Type</label>
            <select
              id="type"
              value={filter.type}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option>All Types</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Agricultural</option>
            </select>
          </div>
          <div>
            <label htmlFor="min">Min Price (NPR)</label>
            <input
              id="min"
              placeholder="e.g. 5000000"
              value={filter.minPrice}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, minPrice: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="max">Max Price (NPR)</label>
            <input
              id="max"
              placeholder="e.g. 20000000"
              value={filter.maxPrice}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, maxPrice: e.target.value }))
              }
            />
          </div>
          <div className="filter-actions">
            <button className="apply" type="button">
              Apply Filters
            </button>
            <button
              className="reset"
              type="button"
              onClick={() =>
                setFilter({
                  location: "",
                  type: "All Types",
                  minPrice: "",
                  maxPrice: "",
                })
              }
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="property-list">
        <h3>Showing {filtered.length} land properties</h3>
        <div className="property-grid">
          {filtered.map((item) => (
            <article key={item.id} className="property-card">
              <div className="property-media">
                <span className="property-tag">{item.sale_status || "Available"}</span>
                {item.image ? <img src={item.image} alt={item.title} /> : null}
              </div>
              <div className="property-body">
                <p className="price">{item.price}</p>
                <h4>{item.title || item.property_type}</h4>
                <p className="location">{item.location}</p>
                <div className="meta">{item.description || "Land listing"}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
