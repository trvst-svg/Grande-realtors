import { useEffect, useState } from "react";
import {
  API_BASE_URL,
  completePropertySale,
  fetchAgentDashboard,
  fetchPropertyInquiries,
} from "./api.js";
import AgentShell from "./components/AgentShell.jsx";
import "./dashboard.css";

export default function AgentAssignedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saleDrafts, setSaleDrafts] = useState({});
  const [inquiriesByProperty, setInquiriesByProperty] = useState({});
  const [openSalePropertyId, setOpenSalePropertyId] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [submittingPropertyId, setSubmittingPropertyId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!stored.id) {
      setLoading(false);
      setError("Unable to load assigned properties.");
      return;
    }

    fetchAgentDashboard(stored.id)
      .then((data) => {
        if (!mounted) return;
        setProperties(data.assignedProperties || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "Unable to load assigned properties.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const openSaleForm = async (propertyId, price) => {
    setActionStatus({ type: "", message: "" });
    setOpenSalePropertyId(propertyId);
    setSaleDrafts((prev) => ({
      ...prev,
      [propertyId]: prev[propertyId] || { buyer_id: "", amount: price || "" },
    }));
    if (!inquiriesByProperty[propertyId]) {
      try {
        const items = await fetchPropertyInquiries(propertyId);
        setInquiriesByProperty((prev) => ({ ...prev, [propertyId]: items }));
      } catch (err) {
        setActionStatus({ type: "error", message: err.message });
      }
    }
  };

  const handleCompleteSale = async (propertyId) => {
    const draft = saleDrafts[propertyId] || {};
    setActionStatus({ type: "", message: "" });
    setSubmittingPropertyId(propertyId);
    try {
      await completePropertySale(propertyId, {
        buyer_id: Number(draft.buyer_id),
        amount: Number(draft.amount),
        payment_method: "inquiry",
      });
      setProperties((prev) =>
        prev.map((item) =>
          item.id === propertyId ? { ...item, sale_status: "sold" } : item
        )
      );
      setOpenSalePropertyId(null);
      setActionStatus({ type: "success", message: "Property marked as sold." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setSubmittingPropertyId(null);
    }
  };

  return (
    <AgentShell
      title="Assigned Properties"
      subtitle="Properties currently assigned to you for follow-up and handling."
    >
      <section className="dashboard-requests">
        <div className="panel">
          <h2>Your Assignments</h2>
          <p className="muted">Only properties assigned to this sales handler are shown here.</p>
          {actionStatus.message ? (
            <p className={`status ${actionStatus.type}`}>{actionStatus.message}</p>
          ) : null}

          {loading ? (
            <p className="muted">Loading assigned properties...</p>
          ) : error ? (
            <p className="muted">{error}</p>
          ) : properties.length ? (
            <div className="property-request-list">
              {properties.map((item) => {
                const imageUrl = item.image ? `${API_BASE_URL}${item.image}` : "";
                return (
                  <div key={item.id} className="property-request-card">
                    <div className="property-request-media">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.location} />
                      ) : (
                        <div className="image-placeholder">No image</div>
                      )}
                    </div>
                    <div className="property-request-body">
                      <div>
                        <h3>{item.property_type}</h3>
                        <p>{item.location}</p>
                        <span>NPR {item.price}</span>
                      </div>
                      <div className="property-request-meta">
                        <span>{item.listing_type || item.listing_purpose || "Listing"}</span>
                        {item.sale_status ? <span>Status: {item.sale_status}</span> : null}
                      </div>
                      <div className="property-request-actions-inline property-management-actions">
                        {String(item.sale_status || "").toLowerCase() !== "sold" ? (
                          <button
                            type="button"
                            className="approve-btn"
                            onClick={() => openSaleForm(item.id, item.price)}
                          >
                            Mark Sold
                          </button>
                        ) : null}
                      </div>
                      {openSalePropertyId === item.id ? (
                        <div className="sale-complete-form">
                          <label htmlFor={`buyer-${item.id}`}>Select Buyer</label>
                          <select
                            id={`buyer-${item.id}`}
                            value={saleDrafts[item.id]?.buyer_id || ""}
                            onChange={(event) =>
                              setSaleDrafts((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  buyer_id: event.target.value,
                                },
                              }))
                            }
                          >
                            <option value="">Choose an inquiry</option>
                            {(inquiriesByProperty[item.id] || []).map((inquiry) => (
                              <option key={inquiry.id} value={inquiry.user_id}>
                                {inquiry.firstname} {inquiry.lastname} - {inquiry.email}
                              </option>
                            ))}
                          </select>

                          <label htmlFor={`amount-${item.id}`}>Sale Amount</label>
                          <input
                            id={`amount-${item.id}`}
                            type="number"
                            value={saleDrafts[item.id]?.amount || ""}
                            onChange={(event) =>
                              setSaleDrafts((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  amount: event.target.value,
                                },
                              }))
                            }
                          />

                          <div className="property-request-actions-inline property-management-actions">
                            <button
                              type="button"
                              className="approve-btn"
                              onClick={() => handleCompleteSale(item.id)}
                              disabled={submittingPropertyId === item.id}
                            >
                              {submittingPropertyId === item.id
                                ? "Saving..."
                                : "Confirm Sale"}
                            </button>
                            <button
                              type="button"
                              className="reject-btn"
                              onClick={() => setOpenSalePropertyId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">No assigned properties yet.</p>
          )}
        </div>
      </section>
    </AgentShell>
  );
}
