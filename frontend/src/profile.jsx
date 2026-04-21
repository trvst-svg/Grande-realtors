import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { deletePropertyListing, fetchUserProfile } from "./api.js";
import "./profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [deletingId, setDeletingId] = useState(null);
  const handleSupport = () => navigate("/contact");

  const loadProfile = async (userId) => {
    const profile = await fetchUserProfile(userId);
    setData(profile);
  };

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!token || !stored.id) {
      navigate("/login");
      return;
    }

    loadProfile(stored.id)
      .catch((err) => {
        const message = err?.message || "Unable to load profile data.";
        if (
          message.toLowerCase().includes("authorization") ||
          message.toLowerCase().includes("forbidden")
        ) {
          localStorage.removeItem("gr_token");
          localStorage.removeItem("gr_user");
          localStorage.removeItem("gr_refresh_token");
          navigate("/login");
          return;
        }
        setError(message);
        setData(null);
      });
  }, [navigate]);

  const handleDeleteProperty = async (propertyId) => {
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!stored.id) return;
    if (!window.confirm("Delete this listing? This action cannot be undone.")) {
      return;
    }
    setActionStatus({ type: "", message: "" });
    setDeletingId(propertyId);
    try {
      await deletePropertyListing(propertyId);
      await loadProfile(stored.id);
      setActionStatus({ type: "success", message: "Listing deleted." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  if (!data) {
    return (
      <div className="profile-page">
        <Navbar showProfile />
        <div className="profile-empty">
          <h1>Profile</h1>
          <p>{error || "Unable to load profile data."}</p>
        </div>
      </div>
    );
  }

  const fullName = `${data.user.firstname} ${data.user.lastname}`;

  return (
    <div className="profile-page">
      <Navbar showProfile profileInitials={data.user.firstname[0]} />
      <div className="profile-layout">
        <section className="profile-card">
          <div className="avatar">{data.user.firstname[0]}</div>
          <h2>{fullName}</h2>
          <p>{data.user.role || "Member"}</p>
          <div className="profile-stats">
            <div>
              <strong>{data.stats.properties}</strong>
              <span>Properties</span>
            </div>
            <div>
              <strong>{data.stats.favorites}</strong>
              <span>Favorites</span>
            </div>
            <div>
              <strong>{data.stats.bids}</strong>
              <span>Active Bids</span>
            </div>
          </div>
          <button type="button" onClick={handleSupport}>
            Edit Profile
          </button>
        </section>

        <section className="profile-info">
          <div className="info-card">
            <div className="info-header">
              <h3>Personal Information</h3>
              <button className="link" type="button" onClick={handleSupport}>
                Edit
              </button>
            </div>
            <div className="info-grid">
              <div>
                <span>Full Name</span>
                <p>{fullName}</p>
              </div>
              <div>
                <span>Email Address</span>
                <p>{data.user.email}</p>
              </div>
              <div>
                <span>Phone Number</span>
                <p>{data.user.number || "N/A"}</p>
              </div>
              <div>
                <span>Member Since</span>
                <p>{new Date(data.user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <h3>My Properties</h3>
              <button
                className="link"
                type="button"
                onClick={() => navigate("/dashboard/user")}
              >
                View All →
              </button>
            </div>
            {actionStatus.message ? (
              <p className={`status ${actionStatus.type}`}>{actionStatus.message}</p>
            ) : null}
            <div className="property-mini-grid">
              {data.myProperties.length ? (
                data.myProperties.map((property) => (
                  <div key={property.id} className="property-mini">
                    <div className="mini-thumb" />
                    <div className="mini-body">
                      <strong>{property.property_type}</strong>
                      <p>{property.location}</p>
                      <span>NPR {property.price}</span>
                      <div className="mini-actions">
                        <Link className="mini-link" to={`/properties/${property.id}`}>
                          View
                        </Link>
                        <Link
                          className="mini-link secondary"
                          to={`/properties/${property.id}/edit`}
                        >
                          Edit
                        </Link>
                        {property.property_type === "land" &&
                        (!property.sale_status ||
                          property.sale_status === "available") &&
                        !property.auction_id ? (
                          <Link
                            className="mini-link auction-link"
                            to={`/auctions/new/${property.id}`}
                          >
                            List for Auction
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          className="mini-link danger-button"
                          onClick={() => handleDeleteProperty(property.id)}
                          disabled={deletingId === property.id}
                        >
                          {deletingId === property.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">No properties yet.</p>
              )}
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <h3>Bookmarked Properties</h3>
              <button
                className="link"
                type="button"
                onClick={() => navigate("/dashboard/user")}
              >
                View All →
              </button>
            </div>
            <div className="property-mini-grid">
              {data.favoriteProperties?.length ? (
                data.favoriteProperties.map((property) => (
                  <div key={property.id} className="property-mini">
                    <div className="mini-thumb" />
                    <div className="mini-body">
                      <strong>{property.property_type}</strong>
                      <p>{property.location}</p>
                      <span>NPR {property.price}</span>
                      <div className="mini-actions">
                        <Link className="mini-link" to={`/properties/${property.id}`}>
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">No bookmarked properties yet.</p>
              )}
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <h3>Security & Privacy</h3>
              <button className="link" type="button" onClick={handleSupport}>
                Edit
              </button>
            </div>
            <div className="security-item">
              <div>
                <strong>Change Password</strong>
                <p>Update your password regularly to keep your account secure.</p>
              </div>
              <button type="button" onClick={handleSupport}>
                Change
              </button>
            </div>
            <div className="security-item">
              <div>
                <strong>Privacy Settings</strong>
                <p>Control who can see your profile and properties.</p>
              </div>
              <button type="button" onClick={handleSupport}>
                Manage
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
