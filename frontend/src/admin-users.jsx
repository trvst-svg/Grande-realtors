import { useEffect, useState } from "react";
import {
  API_BASE_URL,
  approveSignupRequest,
  fetchSignupRequests,
  rejectSignupRequest,
} from "./api.js";
import AdminShell from "./components/AdminShell.jsx";
import "./dashboard.css";

export default function AdminUsers() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchSignupRequests()
      .then((items) => {
        if (!mounted) return;
        setRequests(items);
      })
      .catch((err) => {
        if (!mounted) return;
        const message = err.message || "Unable to load signup requests.";
        if (
          message.toLowerCase().includes("authorization") ||
          message.toLowerCase().includes("forbidden")
        ) {
          localStorage.removeItem("gr_token");
          localStorage.removeItem("gr_user");
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

  return (
    <AdminShell title="User Approvals" subtitle="Approve or reject new user signups.">
      <section className="dashboard-requests">
        <div className="panel">
          <h2>Signup Requests</h2>
          <p className="muted">
            Review new users before they can access the platform.
          </p>

          {actionStatus.message ? (
            <p className={`status ${actionStatus.type}`}>{actionStatus.message}</p>
          ) : null}

          {loading ? (
            <p className="muted">Loading signup requests...</p>
          ) : error ? (
            <p className="muted">{error}</p>
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
    </AdminShell>
  );
}
