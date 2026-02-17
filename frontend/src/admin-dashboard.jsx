import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import {
  API_BASE_URL,
  approveSignupRequest,
  fetchAdminDashboard,
  fetchSignupRequests,
  rejectSignupRequest,
} from "./api.js";
import "./dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("gr_token");
    if (!token) {
      navigate("/login");
      return () => {
        mounted = false;
      };
    }
    setLoading(true);
    setRequestsLoading(true);
    setRequestsError("");

    Promise.allSettled([fetchAdminDashboard(), fetchSignupRequests()])
      .then(([dashboardResult, requestsResult]) => {
        if (!mounted) return;

        if (dashboardResult.status === "fulfilled") {
          setData(dashboardResult.value);
        } else {
          const message = dashboardResult.reason?.message || "";
          if (
            message.toLowerCase().includes("authorization") ||
            message.toLowerCase().includes("forbidden")
          ) {
            localStorage.removeItem("gr_token");
            navigate("/login");
            return;
          }
          setData(null);
        }

        if (requestsResult.status === "fulfilled") {
          setRequests(requestsResult.value);
        } else {
          setRequestsError(
            requestsResult.reason?.message ||
              "Unable to load signup requests."
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
          setRequestsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleReasonChange = (userId, value) => {
    setRejectionReasons((prev) => ({ ...prev, [userId]: value }));
  };

  const handleApprove = async (userId) => {
    setActionStatus({ type: "", message: "" });
    setActioningId(userId);
    try {
      await approveSignupRequest(userId);
      setRequests((prev) => prev.filter((user) => user.id !== userId));
      setActionStatus({ type: "success", message: "User approved." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (userId) => {
    const reason = rejectionReasons[userId] || "";
    if (!reason.trim()) {
      setActionStatus({
        type: "error",
        message: "Please provide a rejection reason before sending.",
      });
      return;
    }

    setActionStatus({ type: "", message: "" });
    setActioningId(userId);
    try {
      await rejectSignupRequest(userId, reason.trim());
      setRequests((prev) => prev.filter((user) => user.id !== userId));
      setActionStatus({
        type: "success",
        message: "User rejected and email sent.",
      });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setActioningId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="dashboard-loading">
        <p>{loading ? "Loading admin dashboard..." : "Unable to load dashboard."}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar showProfile />

      <section className="dashboard-hero">
        <h1>Admin Dashboard</h1>
        <p>System overview, users, and property activity.</p>
      </section>

      <section className="dashboard-cards">
        <div className="dash-card">
          <span>Total Users</span>
          <strong>{data.stats.users}</strong>
        </div>
        <div className="dash-card">
          <span>Properties</span>
          <strong>{data.stats.properties}</strong>
        </div>
        <div className="dash-card">
          <span>Auctions</span>
          <strong>{data.stats.auctions}</strong>
        </div>
        <div className="dash-card">
          <span>Total Bids</span>
          <strong>{data.stats.bids}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>Latest Users</h2>
          {data.latestUsers.length ? (
            data.latestUsers.map((user) => (
              <div key={user.id} className="panel-row">
                <div>
                  <strong>
                    {user.firstname} {user.lastname}
                  </strong>
                  <span>{user.email}</span>
                </div>
                <span className="muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">No users yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>Latest Properties</h2>
          {data.latestProperties.length ? (
            data.latestProperties.map((property) => (
              <div key={property.id} className="panel-row">
                <div>
                  <strong>{property.property_type}</strong>
                  <span>{property.location}</span>
                </div>
                <span className="muted">NPR {property.price}</span>
              </div>
            ))
          ) : (
            <p className="muted">No properties yet.</p>
          )}
        </div>
      </section>

      <section className="dashboard-requests">
        <div className="panel">
          <h2>Signup Requests</h2>
          <p className="muted">
            Review new users before they can access the platform.
          </p>

          {actionStatus.message ? (
            <p className={`status ${actionStatus.type}`}>{actionStatus.message}</p>
          ) : null}

          {requestsLoading ? (
            <p className="muted">Loading signup requests...</p>
          ) : requestsError ? (
            <p className="muted">{requestsError}</p>
          ) : requests.length ? (
            <div className="request-list">
              {requests.map((user) => {
                const frontUrl = user.citizenship_front
                  ? `${API_BASE_URL}${user.citizenship_front}`
                  : "";
                const backUrl = user.citizenship_back
                  ? `${API_BASE_URL}${user.citizenship_back}`
                  : "";

                return (
                  <div key={user.id} className="request-card">
                    <div className="request-header">
                      <div>
                        <strong>
                          {user.firstname} {user.lastname}
                        </strong>
                        <span>{user.email}</span>
                        <span>{user.number}</span>
                      </div>
                      <span className="muted">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="request-images">
                      {frontUrl ? (
                        <a href={frontUrl} target="_blank" rel="noreferrer">
                          <img src={frontUrl} alt="Citizenship front" />
                        </a>
                      ) : (
                        <div className="image-placeholder">No front image</div>
                      )}
                      {backUrl ? (
                        <a href={backUrl} target="_blank" rel="noreferrer">
                          <img src={backUrl} alt="Citizenship back" />
                        </a>
                      ) : (
                        <div className="image-placeholder">No back image</div>
                      )}
                    </div>

                    <div className="request-actions">
                      <textarea
                        rows={2}
                        placeholder="Reason for rejection (required)"
                        value={rejectionReasons[user.id] || ""}
                        onChange={(event) =>
                          handleReasonChange(user.id, event.target.value)
                        }
                      />
                      <div className="request-buttons">
                        <button
                          type="button"
                          className="approve-btn"
                          onClick={() => handleApprove(user.id)}
                          disabled={actioningId === user.id}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="reject-btn"
                          onClick={() => handleReject(user.id)}
                          disabled={actioningId === user.id}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">No pending signup requests.</p>
          )}
        </div>
      </section>
    </div>
  );
}
