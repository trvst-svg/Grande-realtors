import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { fetchUserDashboard } from "./api.js";
import "./dashboard.css";

export default function UserDashboard() {
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

    fetchUserDashboard(stored.id)
      .then(setData)
      .catch((err) => {
        const message = err?.message || "Unable to load user dashboard.";
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
        <p>{error || "Loading user dashboard..."}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar showProfile />

      <section className="dashboard-hero">
        <h1>My Dashboard</h1>
        <p>Your properties, favorites, and active bids.</p>
        <Link className="dashboard-action" to="/list-property">
          List a Property
        </Link>
      </section>

      <section className="dashboard-cards">
        <div className="dash-card">
          <span>My Properties</span>
          <strong>{data.stats.owned}</strong>
        </div>
        <div className="dash-card">
          <span>My Auctions</span>
          <strong>{data.stats.myAuctions ?? 0}</strong>
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
                  {property.auction_id ? (
                    <span className="badge">Auction Listed</span>
                  ) : null}
                </div>
                <div className="panel-actions">
                  <span className="muted">NPR {property.price}</span>
                  <Link
                    className="mini-action"
                    to={`/auctions/new/${property.id}`}
                  >
                    List for Auction
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No properties yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>My Auctions</h2>
          {data.myAuctions?.length ? (
            data.myAuctions.map((auction) => (
              <div key={auction.id} className="panel-row">
                <div>
                  <strong>{auction.property_type}</strong>
                  <span>{auction.location}</span>
                  <span className={`badge ${auction.status || "open"}`}>
                    {auction.status || "open"}
                  </span>
                </div>
                <div className="panel-actions">
                  <span className="muted">
                    Current: NPR {auction.current_price}
                  </span>
                  <Link
                    className="mini-action"
                    to={`/bidding/${auction.id}`}
                  >
                    View Auction
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No auctions listed yet.</p>
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
