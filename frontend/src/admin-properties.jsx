import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  API_BASE_URL,
  approvePropertyRequest,
  fetchAuctions,
  fetchProperties,
  fetchPropertyRequests,
  fetchSalesHandlers,
  rejectPropertyRequest,
  updateAuctionStatus,
  updateProperty,
} from "./api.js";
import AdminShell from "./components/AdminShell.jsx";
import "./dashboard.css";

export default function AdminProperties() {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [actioningId, setActioningId] = useState(null);
  const [handlers, setHandlers] = useState([]);
  const [handlerSelection, setHandlerSelection] = useState({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    Promise.all([fetchPropertyRequests(), fetchProperties(), fetchAuctions()])
      .then(([requestItems, propertyItems, auctionItems]) => {
        if (!mounted) return;
        setRequests(requestItems);
        setProperties(propertyItems);
        setAuctions(auctionItems);
      })
      .catch((err) => {
        if (!mounted) return;
        const message = err.message || "Unable to load property requests.";
        if (
          message.toLowerCase().includes("authorization") ||
          message.toLowerCase().includes("forbidden")
        ) {
          localStorage.removeItem("gr_token");
          localStorage.removeItem("gr_user");
          localStorage.removeItem("gr_refresh_token");
          window.location.href = "/login";
          return;
        }
        setError(message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchSalesHandlers()
      .then((items) => {
        setHandlers(items);
      })
      .catch(() => {
        setHandlers([]);
      });
  }, []);

  const handleApprove = async (requestId) => {
    setActionStatus({ type: "", message: "" });
    setActioningId(requestId);
    try {
      const agentId = handlerSelection[requestId];
      if (!agentId) {
        setActionStatus({
          type: "error",
          message: "Select a sales handler before approving.",
        });
        return;
      }
      await approvePropertyRequest(requestId, agentId);
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
      setActionStatus({ type: "success", message: "Property approved." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionStatus({ type: "", message: "" });
    setActioningId(requestId);
    try {
      await rejectPropertyRequest(requestId);
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
      setActionStatus({ type: "success", message: "Property rejected." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setActioningId(null);
    }
  };

  const handleCloseListing = async (propertyId) => {
    setActionStatus({ type: "", message: "" });
    setActioningId(`property-${propertyId}`);
    try {
      await updateProperty(propertyId, { sale_status: "sold" });
      setProperties((prev) =>
        prev.map((item) =>
          item.id === propertyId ? { ...item, sale_status: "sold" } : item
        )
      );
      setActionStatus({ type: "success", message: "Property listing closed." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setActioningId(null);
    }
  };

  const handleCloseAuction = async (auctionId) => {
    setActionStatus({ type: "", message: "" });
    setActioningId(`auction-${auctionId}`);
    try {
      await updateAuctionStatus(auctionId, "closed");
      setAuctions((prev) =>
        prev.map((item) =>
          item.id === auctionId ? { ...item, status: "closed" } : item
        )
      );
      setActionStatus({ type: "success", message: "Auction closed." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setActioningId(null);
    }
  };

  const activeProperties = properties.filter(
    (item) => !item.sale_status || item.sale_status === "available"
  );
  const liveAuctions = auctions.filter((item) => item.status !== "closed");

  return (
    <AdminShell
      title="Property Controls"
      subtitle="Review requests and close approved listings or live auctions."
    >
      <section className="dashboard-requests">
        <div className="panel">
          <h2>Property Requests</h2>
          <p className="muted">Approve or reject submitted properties.</p>

          {actionStatus.message ? (
            <p className={`status ${actionStatus.type}`}>{actionStatus.message}</p>
          ) : null}
          {!loading && requests.length > 0 && !handlers.length ? (
            <p className="status error">
              No sales handlers available. Add at least one to approve listings.
            </p>
          ) : null}

          {loading ? (
            <p className="muted">Loading property requests...</p>
          ) : error ? (
            <p className="muted">{error}</p>
          ) : requests.length ? (
            <div className="property-request-table-wrap">
              <table className="property-request-table">
                <thead>
                  <tr>
                    <th scope="col">Preview</th>
                    <th scope="col">Property</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Listed</th>
                    <th scope="col">Sales Handler</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((item) => {
                    const imageUrl = item.image ? `${API_BASE_URL}${item.image}` : "";
                    return (
                      <tr key={item.id}>
                        <td>
                          {imageUrl ? (
                            <img
                              className="property-request-thumbnail"
                              src={imageUrl}
                              alt={item.location}
                            />
                          ) : (
                            <div className="table-image-placeholder">No image</div>
                          )}
                        </td>
                        <td>
                          <div className="property-cell">
                            <strong>{item.property_type}</strong>
                            <span>{item.location}</span>
                            <span>NPR {item.price}</span>
                          </div>
                        </td>
                        <td>
                          <div className="property-meta-stack">
                            <strong>
                              {item.firstname} {item.lastname}
                            </strong>
                            <span>{item.email}</span>
                          </div>
                        </td>
                        <td>{new Date(item.listed_date).toLocaleDateString()}</td>
                        <td>
                          <select
                            id={`handler-${item.id}`}
                            className="handler-select"
                            aria-label={`Sales handler for property request ${item.id}`}
                            value={handlerSelection[item.id] || ""}
                            onChange={(event) =>
                              setHandlerSelection((prev) => ({
                                ...prev,
                                [item.id]: event.target.value,
                              }))
                            }
                          >
                            <option value="">Select handler</option>
                            {handlers.map((handler) => (
                              <option key={handler.id} value={handler.id}>
                                {handler.firstname} {handler.lastname}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="property-request-actions-inline">
                            <button
                              type="button"
                              className="approve-btn"
                              onClick={() => handleApprove(item.id)}
                              disabled={
                                actioningId === item.id ||
                                !handlers.length ||
                                !handlerSelection[item.id]
                              }
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="reject-btn"
                              onClick={() => handleReject(item.id)}
                              disabled={actioningId === item.id}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No pending property requests.</p>
          )}
        </div>

        <div className="panel">
          <h2>Active Property Listings</h2>
          <p className="muted">Close approved listings that should no longer appear as available.</p>

          {loading ? (
            <p className="muted">Loading active listings...</p>
          ) : activeProperties.length ? (
            <div className="property-request-table-wrap">
              <table className="property-request-table">
                <thead>
                  <tr>
                    <th scope="col">Preview</th>
                    <th scope="col">Property</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProperties.map((item) => {
                    const imageUrl = item.image ? `${API_BASE_URL}${item.image}` : "";
                    return (
                      <tr key={`property-${item.id}`}>
                        <td>
                          {imageUrl ? (
                            <img
                              className="property-request-thumbnail"
                              src={imageUrl}
                              alt={item.location}
                            />
                          ) : (
                            <div className="table-image-placeholder">No image</div>
                          )}
                        </td>
                        <td>
                          <div className="property-cell">
                            <strong>{item.property_type}</strong>
                            <span>{item.location}</span>
                            <span>NPR {item.price}</span>
                          </div>
                        </td>
                        <td>{item.sale_status || "available"}</td>
                        <td>
                          <button
                            type="button"
                            className="reject-btn"
                            onClick={() => handleCloseListing(item.id)}
                            disabled={actioningId === `property-${item.id}`}
                          >
                            {actioningId === `property-${item.id}`
                              ? "Closing..."
                              : "Close Listing"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No active property listings.</p>
          )}
        </div>

        <div className="panel">
          <h2>Live Auctions</h2>
          <p className="muted">Close auctions from the admin dashboard without visiting the bidding page.</p>

          {loading ? (
            <p className="muted">Loading live auctions...</p>
          ) : liveAuctions.length ? (
            <div className="property-request-table-wrap">
              <table className="property-request-table">
                <thead>
                  <tr>
                    <th scope="col">Preview</th>
                    <th scope="col">Auction</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {liveAuctions.map((item) => {
                    const imageUrl = item.image ? `${API_BASE_URL}${item.image}` : "";
                    return (
                      <tr key={`auction-${item.id}`}>
                        <td>
                          {imageUrl ? (
                            <img
                              className="property-request-thumbnail"
                              src={imageUrl}
                              alt={item.location}
                            />
                          ) : (
                            <div className="table-image-placeholder">No image</div>
                          )}
                        </td>
                        <td>
                          <div className="property-cell">
                            <strong>{item.property_type}</strong>
                            <span>{item.location}</span>
                            <span>NPR {item.current_price}</span>
                          </div>
                        </td>
                        <td>{item.status || "open"}</td>
                        <td>
                          <div className="property-request-actions-inline property-management-actions">
                            <Link
                              className="approve-btn action-link-button"
                              to={`/bidding/${item.id}`}
                            >
                              View Auction
                            </Link>
                            <button
                              type="button"
                              className="reject-btn"
                              onClick={() => handleCloseAuction(item.id)}
                              disabled={actioningId === `auction-${item.id}`}
                            >
                              {actioningId === `auction-${item.id}`
                                ? "Closing..."
                                : "Close Auction"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No live auctions.</p>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
