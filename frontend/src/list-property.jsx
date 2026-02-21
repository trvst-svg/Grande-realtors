import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPropertyListing, uploadPropertyImages } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./list-property.css";

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

export default function ListPropertyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    property_type: "land",
    listing_purpose: "sale",
    listing_type: "residential",
    location: "",
    price: "",
    description: "",
  });
  const [land, setLand] = useState(initialLand);
  const [house, setHouse] = useState(initialHouse);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const user = useMemo(() => {
    return JSON.parse(localStorage.getItem("gr_user") || "{}");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

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

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setImages(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!form.location || !form.price || !form.property_type) {
      setStatus({ type: "error", message: "Please fill required fields." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        property_type: form.property_type,
        listing_purpose: form.listing_purpose,
        listing_type: form.listing_type,
        location: form.location,
        price: form.price,
        description: form.description,
      };

      if (form.property_type === "land") {
        payload.land = { ...land };
      }
      if (form.property_type === "house") {
        payload.house = { ...house };
      }

      const response = await createPropertyListing(payload);
      const propertyId = response.property?.id;

      if (propertyId && images.length) {
        await uploadPropertyImages(propertyId, images);
      }

      setStatus({
        type: "success",
        message:
          "Listing submitted. Your property will go live after verification.",
      });
      setForm({
        property_type: "land",
        listing_purpose: "sale",
        listing_type: "residential",
        location: "",
        price: "",
        description: "",
      });
      setLand(initialLand);
      setHouse(initialHouse);
      setImages([]);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-property-page">
      <Navbar showProfile />

      <section className="list-hero">
        <h1>List Your Property</h1>
        <p>
          Provide the details below to submit your property for admin/sales-handler
          verification.
        </p>
      </section>

      <form className="list-form" onSubmit={handleSubmit}>
        <section className="form-card">
          <h2>Contact Details</h2>
          <p className="muted">Based on your profile information.</p>
          <div className="grid">
            <div>
              <label htmlFor="contactName">Name</label>
              <input
                id="contactName"
                value={`${user.firstname || ""} ${user.lastname || ""}`.trim()}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="contactEmail">Email</label>
              <input id="contactEmail" value={user.email || ""} readOnly />
            </div>
            <div>
              <label htmlFor="contactPhone">Phone</label>
              <input id="contactPhone" value={user.number || ""} readOnly />
            </div>
          </div>
        </section>

        <section className="form-card">
          <h2>Property Basics</h2>
          <div className="grid">
            <div>
              <label htmlFor="property_type">Category</label>
              <select
                id="property_type"
                name="property_type"
                value={form.property_type}
                onChange={handleChange}
              >
                <option value="land">Land</option>
                <option value="house">House</option>
              </select>
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
                <option value="rent">Rent</option>
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
              <label htmlFor="price">Budget / Expected Price (NPR)</label>
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

        {form.property_type === "land" ? (
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
          <h2>Images</h2>
          <input type="file" accept="image/*" multiple onChange={handleFiles} />
          <p className="muted">Upload up to 10 images.</p>
        </section>

        {status.message ? (
          <p className={`status ${status.type}`}>{status.message}</p>
        ) : null}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}
