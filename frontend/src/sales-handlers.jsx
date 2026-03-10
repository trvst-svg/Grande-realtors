import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { fetchSalesHandlers } from "./api.js";
import "./sales-handlers.css";

export default function SalesHandlersPage() {
  const [handlers, setHandlers] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchSalesHandlers()
      .then(setHandlers)
      .catch((err) => {
        setStatus({ type: "error", message: err.message || "Unable to load." });
      });
  }, []);

  return (
    <div className="sales-handlers-page">
      <Navbar showProfile />

      <section className="handlers-hero">
        <div>
          <span className="eyebrow">SALES HANDLERS</span>
          <h1>Meet Our Sales Team</h1>
          <p>Browse the properties managed by each sales handler.</p>
        </div>
      </section>

      <section className="handlers-grid">
        {status.message ? (
          <p className={`status ${status.type}`}>{status.message}</p>
        ) : handlers.length ? (
          handlers.map((handler) => (
            <article key={handler.id} className="handler-card">
              <div className="handler-avatar">
                {(handler.firstname || "S").slice(0, 1)}
              </div>
              <div>
                <h3>
                  {handler.firstname} {handler.lastname}
                </h3>
                <p>{handler.email}</p>
                <p>{handler.number || "Phone not available"}</p>
              </div>
              <div className="handler-meta">
                <span>{handler.assigned_count} properties</span>
                <span>Rating {handler.avg_rating}</span>
              </div>
              <Link className="handler-link" to={`/sales-handlers/${handler.id}`}>
                View Profile →
              </Link>
            </article>
          ))
        ) : (
          <p className="muted">No sales handlers found.</p>
        )}
      </section>
    </div>
  );
}
