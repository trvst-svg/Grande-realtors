import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { API_BASE_URL, fetchSalesHandlerProfile } from "./api.js";
import "./sales-handlers.css";

export default function SalesHandlerProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchSalesHandlerProfile(id)
      .then(setProfile)
      .catch((err) => {
        setStatus({ type: "error", message: err.message || "Unable to load." });
      });
  }, [id]);

  if (!profile) {
    return (
      <div className="sales-handlers-page">
        <Navbar showProfile />
        <section className="handlers-hero">
          <p>{status.message || "Loading sales handler..."}</p>
        </section>
      </div>
    );
  }

  const { handler, properties } = profile;
  const fullName = `${handler.firstname} ${handler.lastname}`.trim();

  return (
    <div className="sales-handlers-page">
      <Navbar showProfile />

      <section className="handlers-hero">
        <div>
          <span className="eyebrow">SALES HANDLER</span>
          <h1>{fullName}</h1>
          <p>{handler.email}</p>
          <p>{handler.number || "Phone not available"}</p>
          <p>
            Rating {handler.avg_rating} from {handler.review_count || 0} reviews
          </p>
        </div>
        <Link className="text-link" to="/sales-handlers">
          ← Back to all handlers
        </Link>
      </section>

      <section className="handlers-properties">
        <div className="section-head">
          <h2>Recent Feedback</h2>
          <span>{profile.feedback?.length || 0} reviews</span>
        </div>
        <div className="handlers-property-grid handler-feedback-grid">
          {profile.feedback?.length ? (
            profile.feedback.map((item) => (
              <div key={item.id} className="handler-property-card feedback-card">
                <div className="property-body">
                  <p className="price">{item.stars}/5</p>
                  <h4>
                    {item.buyer_firstname} {item.buyer_lastname}
                  </h4>
                  <p className="location">{item.review || "No written review."}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No feedback yet.</p>
          )}
        </div>
      </section>

      <section className="handlers-properties">
        <div className="section-head">
          <h2>Assigned Properties</h2>
          <span>{properties.length} listings</span>
        </div>
        <div className="handlers-property-grid">
          {properties.length ? (
            properties.map((property) => (
              <Link
                key={property.property_id}
                className="handler-property-card"
                to={`/properties/${property.property_id}`}
              >
                <div className="property-media">
                  {property.image ? (
                    <img
                      src={`${API_BASE_URL}${property.image}`}
                      alt={property.location}
                    />
                  ) : null}
                </div>
                <div className="property-body">
                  <p className="price">NPR {property.price}</p>
                  <h4>{property.property_type}</h4>
                  <p className="location">{property.location}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="muted">No properties assigned.</p>
          )}
        </div>
      </section>
    </div>
  );
}
