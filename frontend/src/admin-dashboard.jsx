import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import { fetchAdminDashboard } from "./api.js";
import "./dashboard.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAdminDashboard().then(setData).catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="dashboard-loading">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar showProfile />

      <section className="dashboard-hero">
        <h1>Admin Dashboard</h1>
        <p>System overview, users, and property activity.</p>
      </section>

      <section className="dashboard-cards">
        <div className="dash-card">
          <span>Total Users</span>
          <strong>{data.stats.users}</strong>
        </div>
        <div className="dash-card">
          <span>Properties</span>
          <strong>{data.stats.properties}</strong>
        </div>
        <div className="dash-card">
          <span>Auctions</span>
          <strong>{data.stats.auctions}</strong>
        </div>
        <div className="dash-card">
          <span>Total Bids</span>
          <strong>{data.stats.bids}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>Latest Users</h2>
          {data.latestUsers.length ? (
            data.latestUsers.map((user) => (
              <div key={user.id} className="panel-row">
                <div>
                  <strong>
                    {user.firstname} {user.lastname}
                  </strong>
                  <span>{user.email}</span>
                </div>
                <span className="muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">No users yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>Latest Properties</h2>
          {data.latestProperties.length ? (
            data.latestProperties.map((property) => (
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
      </section>
    </div>
  );
}
