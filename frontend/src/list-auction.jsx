import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAuctionListing, fetchProperty } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./dashboard.css";

export default function ListAuctionPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({
    starting_price: "",
    start_time: "",
    end_time: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    if (!token) {
      navigate("/login");
      return;
    }

    let mounted = true;
    setLoading(true);
    fetchProperty(propertyId)
      .then((data) => {
        if (!mounted) return;
        setProperty(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus({ type: "error", message: err.message });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate, propertyId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!form.starting_price) {
      setStatus({ type: "error", message: "Starting price is required." });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        property_id: propertyId,
        starting_price: Number(form.starting_price),
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      };
      const data = await createAuctionListing(payload);
      setStatus({
        type: "success",
        message: data.message || "Auction created.",
      });
      setTimeout(() => navigate("/bidding"), 800);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !property) {
    return (
      <div className="dashboard-page">
        <Navbar showProfile />
        <section className="dashboard-hero">
          <h1>List Property for Bidding</h1>
          <p>{status.message || "Loading property..."}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar showProfile />

      <section className="dashboard-hero">
        <h1>List Property for Bidding</h1>
        <p>
          {property.property_type} in {property.location}
        </p>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>Auction Details</h2>
          {property.request_status &&
          property.request_status !== "approved" ? (
            <p className="status error">
              This property is not approved yet. Please wait for admin approval
              before listing it for auction.
            </p>
          ) : null}
          {property.sale_status && property.sale_status !== "available" ? (
            <p className="status error">
              This property is not available for auction.
            </p>
          ) : null}
          <form className="auction-form" onSubmit={handleSubmit}>
            <label htmlFor="starting_price">Starting Price (NPR)</label>
            <input
              id="starting_price"
              name="starting_price"
              type="number"
              min="1"
              value={form.starting_price}
              onChange={handleChange}
              placeholder="e.g. 5000000"
              required
            />

            <label htmlFor="start_time">Start Time (optional)</label>
            <input
              id="start_time"
              name="start_time"
              type="datetime-local"
              value={form.start_time}
              onChange={handleChange}
            />

            <label htmlFor="end_time">End Time (optional)</label>
            <input
              id="end_time"
              name="end_time"
              type="datetime-local"
              value={form.end_time}
              onChange={handleChange}
            />

            {status.message ? (
              <p className={`status ${status.type}`}>{status.message}</p>
            ) : null}

            <button
              type="submit"
              disabled={
                submitting ||
                (property.request_status &&
                  property.request_status !== "approved") ||
                (property.sale_status && property.sale_status !== "available")
              }
            >
              {submitting ? "Creating Auction..." : "Create Auction"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Property Snapshot</h2>
          <div className="panel-row">
            <div>
              <strong>Type</strong>
              <span>{property.property_type}</span>
            </div>
            <span className="muted">ID {property.id}</span>
          </div>
          <div className="panel-row">
            <div>
              <strong>Location</strong>
              <span>{property.location}</span>
            </div>
            <span className="muted">Sale Status: {property.sale_status}</span>
          </div>
          <div className="panel-row">
            <div>
              <strong>Listed Price</strong>
              <span>NPR {property.price}</span>
            </div>
            <span className="muted">Type: {property.property_type}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
