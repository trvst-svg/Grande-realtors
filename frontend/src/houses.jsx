import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, fetchProperties } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./properties.css";

export default function HousesPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({
    location: "",
    type: "All Types",
    minPrice: "",
    maxPrice: "",
  });
  const [draft, setDraft] = useState({
    location: "",
    type: "All Types",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchProperties("house").then(setItems).catch(() => setItems([]));
  }, []);

  const filtered = items.filter((item) => {
    const matchLocation = filter.location
      ? item.location?.toLowerCase().includes(filter.location.toLowerCase())
      : true;
    const matchType =
      filter.type === "All Types"
        ? true
        : (item.listing_type || "").toLowerCase() ===
          filter.type.toLowerCase();
    const price = Number(item.price || 0);
    const matchMin = filter.minPrice ? price >= Number(filter.minPrice) : true;
    const matchMax = filter.maxPrice ? price <= Number(filter.maxPrice) : true;
    return matchLocation && matchType && matchMin && matchMax;
  });

  const handleApply = () => setFilter({ ...draft });

  const handleReset = () => {
    const reset = {
      location: "",
      type: "All Types",
      minPrice: "",
      maxPrice: "",
    };
    setDraft(reset);
    setFilter(reset);
  };

  return (
    <div className="property-page">
      <Navbar showProfile />

      <section className="property-hero">
        <h1>House Properties</h1>
        <p>Find your dream house for your next project</p>
      </section>

      <section className="filters">
        <h4>Search Filters</h4>
        <div className="filter-grid">
          <div>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              placeholder="e.g. Lalitpur"
              value={draft.location}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, location: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="type">House Type</label>
            <select
              id="type"
              value={draft.type}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option>All Types</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Semi-commercial</option>
            </select>
          </div>
          <div>
            <label htmlFor="min">Min Price (NPR)</label>
            <input
              id="min"
              placeholder="e.g. 5000000"
              value={draft.minPrice}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, minPrice: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="max">Max Price (NPR)</label>
            <input
              id="max"
              placeholder="e.g. 20000000"
              value={draft.maxPrice}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, maxPrice: e.target.value }))
              }
            />
          </div>
          <div className="filter-actions">
            <button className="apply" type="button" onClick={handleApply}>
              Apply Filters
            </button>
            <button
              className="reset"
              type="button"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="property-list">
        <h3>Showing {filtered.length} house properties</h3>
        <div className="property-grid">
          {filtered.map((item) => (
            <Link
              key={item.id}
              className="property-card-link"
              to={`/properties/${item.id}`}
            >
              <article className="property-card">
                <div className="property-media">
                  <span className="property-tag">
                    {item.sale_status || "Available"}
                  </span>
                  {item.image ? (
                    <img
                      src={`${API_BASE_URL}${item.image}`}
                      alt={item.title || item.property_type}
                    />
                  ) : null}
                </div>
                <div className="property-body">
                  <p className="price">NPR {item.price}</p>
                  <h4>{item.title || item.property_type}</h4>
                  <p className="location">{item.location}</p>
                  <div className="meta">
                    {item.description || "House listing"}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
