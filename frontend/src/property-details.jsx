import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  API_BASE_URL,
  fetchProperty,
  fetchPropertyBookmarkStatus,
  fetchUserProfile,
  addPropertyBookmark,
  removePropertyBookmark,
  submitPropertyInquiry,
} from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./property-details.css";

function resolveImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("data:")) return path;
  return `${API_BASE_URL}${path}`;
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number.toLocaleString();
}

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [bookmarkStatus, setBookmarkStatus] = useState({ type: "", message: "" });
  const [inquiryStatus, setInquiryStatus] = useState({ type: "", message: "" });
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("gr_token"));

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProperty(id)
      .then((data) => {
        if (!mounted) return;
        setProperty(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus({ type: "error", message: err.message || "Unable to load property." });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (property?.id) {
      setActiveImageIndex(0);
      setInquiryStatus({ type: "", message: "" });
      setInquiry({
        name: currentUser
          ? `${currentUser.firstname || ""} ${currentUser.lastname || ""}`.trim()
          : "",
        email: currentUser?.email || "",
        phone: currentUser?.number || "",
        message: "",
      });
    }
  }, [property?.id, currentUser]);

  useEffect(() => {
    if (!hasToken) {
      setCurrentUser(null);
      return;
    }
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    } catch {
      stored = {};
    }
    if (!stored.id) return;
    setCurrentUser((prev) => prev || stored);
    fetchUserProfile(stored.id)
      .then((data) => {
        setCurrentUser(data.user);
        setInquiry((prev) => ({
          name:
            prev.name ||
            `${data.user.firstname || ""} ${data.user.lastname || ""}`.trim(),
          email: prev.email || data.user.email || "",
          phone: prev.phone || data.user.number || "",
          message: prev.message || "",
        }));
      })
      .catch(() => {});
  }, [hasToken]);

  useEffect(() => {
    if (!property?.id || !hasToken) {
      setIsBookmarked(false);
      return;
    }
    fetchPropertyBookmarkStatus(property.id)
      .then((data) => setIsBookmarked(Boolean(data.isBookmarked)))
      .catch(() => {});
  }, [property?.id, hasToken]);

  if (loading) {
    return (
      <div className="property-details">
        <Navbar showProfile />
        <section className="details-hero">
          <p>Loading property...</p>
        </section>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-details">
        <Navbar showProfile />
        <section className="details-hero">
          <p>{status.message || "Property not found."}</p>
        </section>
      </div>
    );
  }

  const images = Array.isArray(property.images) ? property.images : [];
  const normalizedImages = images.map((img) =>
    typeof img === "string" ? { image_url: img } : img
  );
  const displayImages = normalizedImages.length
    ? normalizedImages
    : property.image
    ? [{ image_url: property.image }]
    : [];
  const primaryImage = displayImages[0]?.image_url || "";
  const activeImage = displayImages[activeImageIndex]?.image_url || primaryImage;
  const hasMultipleImages = displayImages.length > 1;

  const salesHandler = property.sales_handler;
  const salesHandlerName = salesHandler
    ? `${salesHandler.firstname || ""} ${salesHandler.lastname || ""}`.trim()
    : "";
  const isOwner = Boolean(
    hasToken && currentUser?.id && property.owner_id === currentUser.id
  );

  const houseDetails = property.details;
  const landDetails = property.details;
  const backRoute =
    property.property_type === "land"
      ? "/lands"
      : property.property_type === "house"
      ? "/houses"
      : "/home";

  const title =
    property.title ||
    (property.property_type && property.location
      ? `${property.property_type} in ${property.location}`
      : "Property Details");

  return (
    <div className="property-details">
      <Navbar showProfile />

      <section className="details-hero">
        <div>
          <span className="details-tag">{property.property_type}</span>
          <h1>{title}</h1>
          <p className="details-location">{property.location}</p>
        </div>
        <Link className="details-back" to={backRoute}>
          ← Back to listings
        </Link>
      </section>

      <section className="details-grid">
        <div>
          <div className="details-media">
            {activeImage ? (
              <img
                src={resolveImageUrl(activeImage)}
                alt={property.location || "Property"}
              />
            ) : (
              <div className="media-placeholder">No image</div>
            )}
            {hasMultipleImages ? (
              <>
                <button
                  type="button"
                  className="media-nav prev"
                  onClick={() =>
                    setActiveImageIndex(
                      (prev) =>
                        (prev - 1 + displayImages.length) % displayImages.length
                    )
                  }
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="media-nav next"
                  onClick={() =>
                    setActiveImageIndex(
                      (prev) => (prev + 1) % displayImages.length
                    )
                  }
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          {hasMultipleImages ? (
            <div className="details-gallery">
              {displayImages.map((img, index) => (
                <button
                  key={img.id || img.image_url || index}
                  type="button"
                  className={`gallery-item${index === activeImageIndex ? " active" : ""}`}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={resolveImageUrl(img.image_url)} alt="Property" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="details-card">
          <div className="price-block">
            <span className="label">Price</span>
            <strong>
              {property.price ? `NPR ${property.price}` : "Price on request"}
            </strong>
          </div>

          <div className="bookmark-row">
            <button
              type="button"
              className={`bookmark-btn${isBookmarked ? " active" : ""}`}
              disabled={!hasToken || isOwner || bookmarking}
              onClick={async () => {
                if (!property?.id) return;
                setBookmarkStatus({ type: "", message: "" });
                setBookmarking(true);
                try {
                  if (isBookmarked) {
                    await removePropertyBookmark(property.id);
                    setIsBookmarked(false);
                  } else {
                    await addPropertyBookmark(property.id);
                    setIsBookmarked(true);
                  }
                } catch (err) {
                  setBookmarkStatus({ type: "error", message: err.message });
                } finally {
                  setBookmarking(false);
                }
              }}
            >
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
            {!hasToken ? (
              <span className="bookmark-note">Sign in to bookmark.</span>
            ) : null}
            {isOwner ? (
              <span className="bookmark-note">Owners cannot bookmark.</span>
            ) : null}
          </div>
          {bookmarkStatus.message ? (
            <p className={`status ${bookmarkStatus.type}`}>
              {bookmarkStatus.message}
            </p>
          ) : null}

          {isOwner ? (
            <Link className="text-link" to={`/properties/${property.id}/edit`}>
              Edit this property →
            </Link>
          ) : null}

          <div className="meta-grid">
            <div>
              <span className="label">Listing Type</span>
              <p>{property.listing_type || "-"}</p>
            </div>
            <div>
              <span className="label">Purpose</span>
              <p>{property.listing_purpose || "sale"}</p>
            </div>
            <div>
              <span className="label">Status</span>
              <p>{property.sale_status || "available"}</p>
            </div>
            <div>
              <span className="label">Listed Date</span>
              <p>
                {property.listed_date
                  ? new Date(property.listed_date).toLocaleDateString()
                  : "-"}
              </p>
            </div>
            <div>
              <span className="label">Seller Rating</span>
              <p>
                {property.seller_rating
                  ? `${property.seller_rating.avg_rating} (${property.seller_rating.review_count})`
                  : "Not rated"}
              </p>
            </div>
          </div>

          <div className="details-description">
            <h3>Description</h3>
            <p>{property.description || "No description provided."}</p>
          </div>

          <div className="details-contact-inline">
            <div>
              <h3>Assigned Sales Handler</h3>
              {salesHandler ? (
                <div className="handler-info">
                  <p className="handler-name">
                    {salesHandlerName || "Sales Handler"}
                  </p>
                  <p>{salesHandler.email || "Email not available"}</p>
                  <p>{salesHandler.number || "Phone not available"}</p>
                  <Link className="text-link" to={`/sales-handlers/${salesHandler.id}`}>
                    View profile →
                  </Link>
                </div>
              ) : (
                <p className="handler-empty">No sales handler assigned.</p>
              )}
              {isOwner ? (
                <p className="handler-empty">
                  This is your property. Manage it from your profile.
                </p>
              ) : null}
            </div>

            {!isOwner ? (
              <div className="contact-form">
                <h4>Send an inquiry</h4>
                <p className="muted">
                  We will automatically include the property details in your message.
                </p>
                {!hasToken ? (
                  <p className="status error">
                    Please sign in to contact the sales handler.
                  </p>
                ) : null}
                {isOwner ? (
                  <p className="status error">
                    Owners cannot contact their own property.
                  </p>
                ) : null}
                {!salesHandler ? (
                  <p className="muted">Inquiry is unavailable until a sales handler is assigned.</p>
                ) : null}
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setInquiryStatus({ type: "", message: "" });
                    setSending(true);
                    try {
                      const data = await submitPropertyInquiry(property.id, inquiry);
                      setInquiryStatus({
                        type: "success",
                        message: data.message || "Inquiry sent.",
                      });
                      setInquiry((prev) => ({ ...prev, message: "" }));
                    } catch (err) {
                      setInquiryStatus({ type: "error", message: err.message });
                    } finally {
                      setSending(false);
                    }
                  }}
                >
                  <label htmlFor="inquiry-name">Full Name</label>
                  <input
                    id="inquiry-name"
                    type="text"
                    value={inquiry.name}
                    onChange={(event) =>
                      setInquiry((prev) => ({ ...prev, name: event.target.value }))
                    }
                    required
                    disabled={!salesHandler || !hasToken || isOwner || sending}
                  />

                  <label htmlFor="inquiry-email">Email</label>
                  <input
                    id="inquiry-email"
                    type="email"
                    value={inquiry.email}
                    onChange={(event) =>
                      setInquiry((prev) => ({ ...prev, email: event.target.value }))
                    }
                    required
                    disabled={!salesHandler || !hasToken || isOwner || sending}
                  />

                  <label htmlFor="inquiry-phone">Phone (optional)</label>
                  <input
                    id="inquiry-phone"
                    type="text"
                    value={inquiry.phone}
                    onChange={(event) =>
                      setInquiry((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    disabled={!salesHandler || !hasToken || isOwner || sending}
                  />

                  <label htmlFor="inquiry-message">Message</label>
                  <textarea
                    id="inquiry-message"
                    rows="4"
                    value={inquiry.message}
                    onChange={(event) =>
                      setInquiry((prev) => ({ ...prev, message: event.target.value }))
                    }
                    required
                    disabled={!salesHandler || !hasToken || isOwner || sending}
                    placeholder="Tell us what you are looking for."
                  />

                  {inquiryStatus.message ? (
                    <p className={`status ${inquiryStatus.type}`}>
                      {inquiryStatus.message}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!salesHandler || !hasToken || isOwner || sending}
                  >
                    {sending ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              </div>
            ) : null}
          </div>

          <div className="details-feedback-grid">
            <div className="feedback-card">
              <h3>Seller Feedback</h3>
              {property.seller_rating?.recent_feedback?.length ? (
                property.seller_rating.recent_feedback.map((item) => (
                  <div key={item.id} className="feedback-item">
                    <strong>{item.stars}/5</strong>
                    <p>{item.review || "No written review."}</p>
                    <span>
                      {item.buyer_firstname} {item.buyer_lastname}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted">No seller feedback yet.</p>
              )}
            </div>

            <div className="feedback-card">
              <h3>Handler Feedback</h3>
              {property.handler_rating?.recent_feedback?.length ? (
                property.handler_rating.recent_feedback.map((item) => (
                  <div key={item.id} className="feedback-item">
                    <strong>{item.stars}/5</strong>
                    <p>{item.review || "No written review."}</p>
                    <span>
                      {item.buyer_firstname} {item.buyer_lastname}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted">No handler feedback yet.</p>
              )}
            </div>
          </div>

        </aside>
      </section>

      {property.property_type === "house" ? (
        <section className="details-specs">
          <div className="specs-head">
            <span className="details-tag">House Details</span>
            <h2>Structure & Layout</h2>
            <p>More detailed breakdown of the home layout and space.</p>
          </div>
          <div className="specs-grid">
            <div className="spec-card">
              <span>Built-up Area</span>
              <strong>
                {houseDetails?.area ? `${formatNumber(houseDetails.area)} sq.ft` : "-"}
              </strong>
              <p>Estimated total usable space across floors.</p>
            </div>
            <div className="spec-card">
              <span>Floors</span>
              <strong>{houseDetails?.number_of_floors ?? "-"}</strong>
              <p>Levels available within the property.</p>
            </div>
            <div className="spec-card">
              <span>Bedrooms</span>
              <strong>{houseDetails?.number_of_bedrooms ?? "-"}</strong>
              <p>Ideal for family or guest accommodation.</p>
            </div>
            <div className="spec-card">
              <span>Price per sq.ft</span>
              <strong>
                {houseDetails?.area && property.price
                  ? `NPR ${formatNumber(Math.round(property.price / houseDetails.area))}`
                  : "-"}
              </strong>
              <p>Helpful for comparing similar listings.</p>
            </div>
          </div>
        </section>
      ) : null}

      {property.property_type === "land" ? (
        <section className="details-specs">
          <div className="specs-head">
            <span className="details-tag">Land Details</span>
            <h2>Plot Specifications</h2>
            <p>Key metrics and access information for the land parcel.</p>
          </div>
          <div className="specs-grid">
            <div className="spec-card">
              <span>Plot Area</span>
              <strong>{landDetails?.area ? `${formatNumber(landDetails.area)} sq.ft` : "-"}</strong>
              <p>Approximate coverage of the land plot.</p>
            </div>
            <div className="spec-card">
              <span>Dimensions</span>
              <strong>{landDetails?.dimensions || "-"}</strong>
              <p>Length and width details as listed.</p>
            </div>
            <div className="spec-card">
              <span>Road Type</span>
              <strong>{landDetails?.road_type || "-"}</strong>
              <p>Nearby road surface for access.</p>
            </div>
            <div className="spec-card">
              <span>Road Access</span>
              <strong>{landDetails?.road_access || "-"}</strong>
              <p>Connectivity and frontage information.</p>
            </div>
            <div className="spec-card">
              <span>Property Face</span>
              <strong>{landDetails?.property_face || "-"}</strong>
              <p>Orientation and facing direction.</p>
            </div>
            <div className="spec-card">
              <span>Price per sq.ft</span>
              <strong>
                {landDetails?.area && property.price
                  ? `NPR ${formatNumber(Math.round(property.price / landDetails.area))}`
                  : "-"}
              </strong>
              <p>Benchmark for land valuation.</p>
            </div>
            {landDetails?.map_link ? (
              <div className="spec-card map-card">
                <span>Map Link</span>
                <a href={landDetails.map_link} target="_blank" rel="noreferrer">
                  View Map
                </a>
                <p>Open location in a new tab.</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <footer className="details-footer">
        <div>
          <h4>Grande Realtors</h4>
          <p>Verified listings, trusted agents, and transparent bidding.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/home">Home</Link>
          <Link to="/lands">Lands</Link>
          <Link to="/houses">Houses</Link>
          <Link to="/bidding">Bidding</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <span>Kathmandu, Nepal</span>
          <span>+977 9812345678</span>
          <span>info@granderealtors.com</span>
        </div>
      </footer>
    </div>
  );
}
