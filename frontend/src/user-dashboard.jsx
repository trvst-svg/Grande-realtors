import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import { fetchUserDashboard } from "./api.js";
import "./dashboard.css";

const fallbackUserId = 1;

export default function UserDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    const userId = stored.id || fallbackUserId;
    fetchUserDashboard(userId).then(setData).catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="dashboard-loading">
        <p>Loading user dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar showProfile />

      <section className="dashboard-hero">
        <h1>My Dashboard</h1>
        <p>Your properties, favorites, and active bids.</p>
      </section>

      <section className="dashboard-cards">
        <div className="dash-card">
          <span>My Properties</span>
          <strong>{data.stats.owned}</strong>
        </div>
        <div className="dash-card">
          <span>Favorites</span>
          <strong>{data.stats.favorites}</strong>
        </div>
        <div className="dash-card">
          <span>Active Bids</span>
          <strong>{data.stats.activeBids}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>My Properties</h2>
          {data.myProperties.length ? (
            data.myProperties.map((property) => (
              <div key={property.id} className="panel-row">
                <div>
                  <strong>{property.property_type}</strong>
                  <span>{property.location}</span>
                </div>
                <span className="muted">NPR {property.price}</span>
              </div>
            ))
          ) : (
            <p className="muted">No properties yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>Listings For You</h2>
          {data.listedProperties.length ? (
            data.listedProperties.map((property) => (
              <div key={property.id} className="panel-row">
                <div>
                  <strong>{property.property_type}</strong>
                  <span>{property.location}</span>
                </div>
                <span className="muted">NPR {property.price}</span>
              </div>
            ))
          ) : (
            <p className="muted">No active listings.</p>
          )}
        </div>
      </section>
    </div>
  );
}
