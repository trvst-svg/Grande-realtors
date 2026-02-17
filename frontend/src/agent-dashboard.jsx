import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { fetchAgentDashboard } from "./api.js";
import "./dashboard.css";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!token || !stored.id) {
      navigate("/login");
      return;
    }

    fetchAgentDashboard(stored.id)
      .then(setData)
      .catch((err) => {
        const message = err?.message || "Unable to load agent dashboard.";
        if (
          message.toLowerCase().includes("authorization") ||
          message.toLowerCase().includes("forbidden")
        ) {
          localStorage.removeItem("gr_token");
          localStorage.removeItem("gr_user");
          navigate("/login");
          return;
        }
        setError(message);
        setData(null);
      });
  }, [navigate]);

  if (!data) {
    return (
      <div className="dashboard-loading">
        <p>{error || "Loading agent dashboard..."}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar showProfile />

      <section className="dashboard-hero">
        <h1>Sales Handler Dashboard</h1>
        <p>Assigned properties and inquiry activity.</p>
      </section>

      <section className="dashboard-cards">
        <div className="dash-card">
          <span>Assigned</span>
          <strong>{data.stats.assigned}</strong>
        </div>
        <div className="dash-card">
          <span>Inquiries</span>
          <strong>{data.stats.inquiries}</strong>
        </div>
        <div className="dash-card">
          <span>Avg Rating</span>
          <strong>{data.stats.rating}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>Assigned Properties</h2>
          {data.assignedProperties.length ? (
            data.assignedProperties.map((property) => (
              <div key={property.id} className="panel-row">
                <div>
                  <strong>{property.property_type}</strong>
                  <span>{property.location}</span>
                </div>
                <span className="muted">
                  NPR {property.price}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">No assignments yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
