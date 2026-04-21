import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AgentShell from "./components/AgentShell.jsx";
import { fetchAgentDashboard } from "./api.js";
import "./dashboard.css";

export default function AgentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!stored.id) {
      return;
    }

    fetchAgentDashboard(stored.id)
      .then(setData)
      .catch((err) => {
        const message = err?.message || "Unable to load agent dashboard.";
        setError(message);
        setData(null);
      });
  }, []);

  if (!data) {
    return (
      <div className="dashboard-loading">
        <p>{error || "Loading agent dashboard..."}</p>
      </div>
    );
  }

  return (
    <AgentShell
      title="Sales Handler Dashboard"
      subtitle="Assigned properties and inquiry activity."
    >
      <section className="dashboard-cards">
        <div className="dash-card">
          <span>Assigned</span>
          <strong>{data.stats.assigned}</strong>
        </div>
        <div className="dash-card">
          <span>Inquiries</span>
          <strong>{data.stats.inquiries}</strong>
        </div>
        <div className="dash-card">
          <span>Avg Rating</span>
          <strong>{data.stats.rating}</strong>
        </div>
        <div className="dash-card">
          <span>Total Reviews</span>
          <strong>{data.stats.reviewCount ?? 0}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>Quick Actions</h2>
          <p className="muted">Use the dedicated agent workspace to review requests and manage your assignments.</p>
          <div className="agent-actions">
            <Link className="dashboard-action" to="/dashboard/agent/properties">
              Review Property Requests
            </Link>
            <Link className="dashboard-action" to="/dashboard/agent/assigned-properties">
              View Assigned Properties
            </Link>
          </div>
        </div>
        <div className="panel">
          <h2>Assignment Snapshot</h2>
          {data.assignedProperties.length ? (
            data.assignedProperties.slice(0, 4).map((property) => (
              <div key={property.id} className="panel-row">
                <div>
                  <strong>{property.property_type}</strong>
                  <span>{property.location}</span>
                </div>
                <span className="muted">NPR {property.price}</span>
              </div>
            ))
          ) : (
            <p className="muted">No assignments yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>Recent Inquiries</h2>
          {data.recentInquiries?.length ? (
            data.recentInquiries.map((inquiry) => (
              <div key={inquiry.id} className="panel-row inquiry-row">
                <div>
                  <strong>
                    {inquiry.firstname} {inquiry.lastname}
                  </strong>
                  <span>
                    {inquiry.property_type} in {inquiry.location}
                  </span>
                  <span>{inquiry.email || inquiry.number || "No contact details"}</span>
                  <span>{inquiry.message}</span>
                </div>
                <div className="panel-actions">
                  <span className="muted">NPR {inquiry.price}</span>
                  <span className="muted">
                    {inquiry.created_at
                      ? new Date(inquiry.created_at).toLocaleDateString()
                      : ""}
                  </span>
                  <Link className="mini-action secondary" to={`/messages?inquiry=${inquiry.id}`}>
                    Message User
                  </Link>
                  <Link className="mini-action" to={`/properties/${inquiry.property_id}`}>
                    View Property
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No inquiries yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>Recent Feedback</h2>
          {data.recentFeedback?.length ? (
            data.recentFeedback.map((item) => (
              <div key={item.id} className="panel-row">
                <div>
                  <strong>
                    {item.buyer_firstname} {item.buyer_lastname}
                  </strong>
                  <span>{item.review || "No written review."}</span>
                  <span>{item.location}</span>
                </div>
                <span className="muted">{item.stars}/5</span>
              </div>
            ))
          ) : (
            <p className="muted">No feedback yet.</p>
          )}
        </div>
      </section>
    </AgentShell>
  );
}
