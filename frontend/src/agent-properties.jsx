import { useEffect, useState } from "react";
import {
  API_BASE_URL,
  approvePropertyRequest,
  fetchPropertyRequests,
  rejectPropertyRequest,
} from "./api.js";
import AgentShell from "./components/AgentShell.jsx";
import "./dashboard.css";

export default function AgentProperties() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchPropertyRequests()
      .then((items) => {
        if (!mounted) return;
        setRequests(items);
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

  const handleApprove = async (requestId) => {
    setActionStatus({ type: "", message: "" });
    setActioningId(requestId);
    try {
      const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
      await approvePropertyRequest(requestId, stored.id);
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

  return (
    <AgentShell
      title="Property Approvals"
      subtitle="Review and verify new property listings."
    >
      <section className="dashboard-requests">
        <div className="panel">
          <h2>Property Requests</h2>
          <p className="muted">Approve or reject submitted properties.</p>

          {actionStatus.message ? (
            <p className={`status ${actionStatus.type}`}>{actionStatus.message}</p>
          ) : null}

          {loading ? (
            <p className="muted">Loading property requests...</p>
          ) : error ? (
            <p className="muted">{error}</p>
          ) : requests.length ? (
            <div className="property-request-list">
              {requests.map((item) => {
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
                        <span>
                          Owner: {item.firstname} {item.lastname}
                        </span>
                        <span>{item.email}</span>
                        <span>
                          Listed: {new Date(item.listed_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="property-request-actions">
                      <button
                        type="button"
                        className="approve-btn"
                        onClick={() => handleApprove(item.id)}
                        disabled={actioningId === item.id}
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
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">No pending property requests.</p>
          )}
        </div>
      </section>
    </AgentShell>
  );
}
