import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  API_BASE_URL,
  fetchProperty,
  updateProperty,
  uploadPropertyImages,
} from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./edit-property.css";

const MAX_IMAGES = 10;

const initialLand = {
  area: "",
  dimensions: "",
  road_type: "",
  road_access: "",
  property_face: "",
  map_link: "",
};

const initialHouse = {
  area: "",
  number_of_floors: "",
  number_of_bedrooms: "",
};

function resolveImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("data:")) return path;
  return `${API_BASE_URL}${path}`;
}

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({
    property_type: "",
    property_type_id: null,
    listing_purpose: "sale",
    listing_type: "residential",
    location: "",
    price: "",
    description: "",
    sale_status: "available",
  });
  const [land, setLand] = useState(initialLand);
  const [house, setHouse] = useState(initialHouse);
  const [images, setImages] = useState([]);
  const [imageStatus, setImageStatus] = useState({ type: "", message: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("gr_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const hydrateForm = (data) => {
    const listingPurpose = data.listing_purpose
      ? String(data.listing_purpose).toLowerCase()
      : "sale";
    const listingType = data.listing_type
      ? String(data.listing_type).toLowerCase()
      : "residential";

    const saleStatus = data.sale_status
      ? String(data.sale_status).toLowerCase()
      : "available";

    setForm({
      property_type: data.property_type || "",
      property_type_id: data.property_type_id || null,
      listing_purpose: listingPurpose,
      listing_type: listingType,
      location: data.location || "",
      price: data.price ?? "",
      description: data.description || "",
      sale_status: saleStatus,
    });

    if (data.property_type === "land") {
      setLand({
        area: data.details?.area || "",
        dimensions: data.details?.dimensions || "",
        road_type: data.details?.road_type || "",
        road_access: data.details?.road_access || "",
        property_face: data.details?.property_face || "",
        map_link: data.details?.map_link || "",
      });
    } else if (data.property_type === "house") {
      setHouse({
        area: data.details?.area || "",
        number_of_floors: data.details?.number_of_floors || "",
        number_of_bedrooms: data.details?.number_of_bedrooms || "",
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    fetchProperty(id)
      .then((data) => {
        setProperty(data);
        hydrateForm(data);
        if (data.owner_id && user?.id && data.owner_id !== user.id) {
          setAuthorized(false);
        }
      })
      .catch((err) => {
        setStatus({ type: "error", message: err.message || "Unable to load." });
      })
      .finally(() => setLoading(false));
  }, [id, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLandChange = (event) => {
    const { name, value } = event.target;
    setLand((prev) => ({ ...prev, [name]: value }));
  };

  const handleHouseChange = (event) => {
    const { name, value } = event.target;
    setHouse((prev) => ({ ...prev, [name]: value }));
  };

  const existingImages = Array.isArray(property?.images) ? property.images : [];
  const maxRemaining = Math.max(0, MAX_IMAGES - existingImages.length);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setImageStatus({ type: "", message: "" });
    if (maxRemaining <= 0) {
      setImageStatus({
        type: "error",
        message: "This property already has the maximum number of images.",
      });
      return;
    }
    setImages((prev) => {
      const merged = [...prev, ...files];
      if (merged.length > maxRemaining) {
        setImageStatus({
          type: "error",
          message: `You can add up to ${maxRemaining} more images.`,
        });
        return merged.slice(0, maxRemaining);
      }
      return merged;
    });
    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setImageStatus({ type: "", message: "" });

    if (!form.location || !form.price) {
      setStatus({ type: "error", message: "Please fill required fields." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        location: form.location,
        description: form.description,
        price: form.price,
        sale_status: form.sale_status,
        listing_purpose: form.listing_purpose,
        listing_type: form.listing_type,
      };

      if (form.property_type_id) {
        payload.property_type_id = form.property_type_id;
      }

      if (property?.property_type === "land") {
        payload.land = { ...land };
      }
      if (property?.property_type === "house") {
        payload.house = { ...house };
      }

      await updateProperty(id, payload);

      if (images.length) {
        await uploadPropertyImages(id, images);
        setImages([]);
      }

      const refreshed = await fetchProperty(id);
      setProperty(refreshed);
      hydrateForm(refreshed);

      setStatus({ type: "success", message: "Property updated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="list-property-page edit-property-page">
        <Navbar showProfile />
        <section className="list-hero">
          <p>Loading property...</p>
        </section>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="list-property-page edit-property-page">
        <Navbar showProfile />
        <section className="list-hero">
          <h1>Access Restricted</h1>
          <p>You can only edit properties you listed.</p>
          <Link className="text-link" to="/profile">
            Go to profile →
          </Link>
        </section>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="list-property-page edit-property-page">
        <Navbar showProfile />
        <section className="list-hero">
          <p>{status.message || "Property not found."}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="list-property-page edit-property-page">
      <Navbar showProfile />

      <section className="list-hero">
        <h1>Edit Property</h1>
        <p>Update the listing details and keep your property current.</p>
      </section>

      <form className="list-form" onSubmit={handleSubmit}>
        <section className="form-card">
          <h2>Property Basics</h2>
          <div className="grid">
            <div>
              <label htmlFor="property_type">Category</label>
              <input id="property_type" value={form.property_type} readOnly />
            </div>
            <div>
              <label htmlFor="listing_purpose">Purpose</label>
              <select
                id="listing_purpose"
                name="listing_purpose"
                value={form.listing_purpose}
                onChange={handleChange}
              >
                <option value="sale">Sale</option>
                <option value="bidding">Bidding</option>
              </select>
            </div>
            <div>
              <label htmlFor="listing_type">Type</label>
              <select
                id="listing_type"
                name="listing_type"
                value={form.listing_type}
                onChange={handleChange}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="semi-commercial">Semi-commercial</option>
              </select>
            </div>
            <div>
              <label htmlFor="sale_status">Status</label>
              <select
                id="sale_status"
                name="sale_status"
                value={form.sale_status}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div>
              <label htmlFor="location">Property Address</label>
              <input
                id="location"
                name="location"
                placeholder="e.g. Budhanilkantha, KTM"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="price">Expected Price (NPR)</label>
              <input
                id="price"
                name="price"
                placeholder="e.g. 25000000"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Tell us about your property."
            value={form.description}
            onChange={handleChange}
          />
        </section>

        {property.property_type === "land" ? (
          <section className="form-card">
            <h2>Land Details</h2>
            <div className="grid">
              <div>
                <label htmlFor="land-area">Area (Aana/Ropani)</label>
                <input
                  id="land-area"
                  name="area"
                  placeholder="e.g. 5 Aana"
                  value={land.area}
                  onChange={handleLandChange}
                />
              </div>
              <div>
                <label htmlFor="land-dimensions">Dimensions</label>
                <input
                  id="land-dimensions"
                  name="dimensions"
                  placeholder="e.g. 20x40 ft"
                  value={land.dimensions}
                  onChange={handleLandChange}
                />
              </div>
              <div>
                <label htmlFor="road-type">Road Type</label>
                <input
                  id="road-type"
                  name="road_type"
                  placeholder="e.g. Pitched"
                  value={land.road_type}
                  onChange={handleLandChange}
                />
              </div>
              <div>
                <label htmlFor="road-access">Road Access</label>
                <input
                  id="road-access"
                  name="road_access"
                  placeholder="e.g. 12 ft"
                  value={land.road_access}
                  onChange={handleLandChange}
                />
              </div>
              <div>
                <label htmlFor="property-face">Property Face</label>
                <input
                  id="property-face"
                  name="property_face"
                  placeholder="e.g. South"
                  value={land.property_face}
                  onChange={handleLandChange}
                />
              </div>
              <div>
                <label htmlFor="map-link">Map Link</label>
                <input
                  id="map-link"
                  name="map_link"
                  placeholder="https://maps.google.com/..."
                  value={land.map_link}
                  onChange={handleLandChange}
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="form-card">
            <h2>House Details</h2>
            <div className="grid">
              <div>
                <label htmlFor="house-area">Built-up Area</label>
                <input
                  id="house-area"
                  name="area"
                  placeholder="e.g. 2400 sq.ft"
                  value={house.area}
                  onChange={handleHouseChange}
                />
              </div>
              <div>
                <label htmlFor="house-floors">Number of Floors</label>
                <input
                  id="house-floors"
                  name="number_of_floors"
                  placeholder="e.g. 2"
                  value={house.number_of_floors}
                  onChange={handleHouseChange}
                />
              </div>
              <div>
                <label htmlFor="house-bedrooms">Number of Bedrooms</label>
                <input
                  id="house-bedrooms"
                  name="number_of_bedrooms"
                  placeholder="e.g. 4"
                  value={house.number_of_bedrooms}
                  onChange={handleHouseChange}
                />
              </div>
            </div>
          </section>
        )}

        <section className="form-card">
          <h2>Existing Images</h2>
          {existingImages.length ? (
            <div className="edit-image-grid">
              {existingImages.map((img, index) => (
                <img
                  key={img.id || img.image_url || index}
                  src={resolveImageUrl(img.image_url)}
                  alt="Property"
                />
              ))}
            </div>
          ) : (
            <p className="muted">No images uploaded yet.</p>
          )}
        </section>

        <section className="form-card">
          <h2>Add More Images</h2>
          <input type="file" accept="image/*" multiple onChange={handleFiles} />
          <p className="muted">
            You can add up to {maxRemaining} more images (max {MAX_IMAGES} total).
          </p>
          {imageStatus.message ? (
            <p className={`status ${imageStatus.type}`}>{imageStatus.message}</p>
          ) : null}
        </section>

        {status.message ? (
          <p className={`status ${status.type}`}>{status.message}</p>
        ) : null}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
