import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminDashboard, fetchPropertyRequests, fetchSignupRequests } from "./api.js";
import AdminShell from "./components/AdminShell.jsx";
import "./dashboard.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [pendingUsers, setPendingUsers] = useState(0);
  const [pendingProperties, setPendingProperties] = useState(0);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      fetchAdminDashboard(),
      fetchSignupRequests(),
      fetchPropertyRequests(),
    ])
      .then(([dashboardResult, userRequests, propertyRequests]) => {
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
            localStorage.removeItem("gr_user");
            localStorage.removeItem("gr_refresh_token");
            window.location.href = "/login";
            return;
          }
          setDashboardError(
            dashboardResult.reason?.message || "Unable to load dashboard."
          );
          setData(null);
        }

        if (userRequests.status === "fulfilled") {
          setPendingUsers(userRequests.value.length);
        } else {
          setRequestsError(
            userRequests.reason?.message || "Unable to load signup requests."
          );
        }

        if (propertyRequests.status === "fulfilled") {
          setPendingProperties(propertyRequests.value.length);
        } else {
          setRequestsError(
            propertyRequests.reason?.message ||
              "Unable to load property requests."
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data?.stats) return [];
    return [
      { label: "Users", value: data.stats.users },
      { label: "Properties", value: data.stats.properties },
      { label: "Auctions", value: data.stats.auctions },
      { label: "Bids", value: data.stats.bids },
    ];
  }, [data]);

  const chartMax = useMemo(() => {
    if (!chartData.length) return 1;
    return Math.max(...chartData.map((item) => item.value), 1);
  }, [chartData]);

  if (loading || !data) {
    return (
      <AdminShell title="Overview" subtitle="System performance and approvals.">
        <div className="dashboard-loading">
          <p>
            {loading
              ? "Loading admin dashboard..."
              : dashboardError || "Unable to load dashboard."}
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Overview" subtitle="System performance and approvals.">
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

      <section className="admin-charts">
        <div className="panel">
          <h2>Platform Activity</h2>
          <p className="muted">Relative activity across core areas.</p>
          <div className="chart-list">
            {chartData.map((item) => (
              <div key={item.label} className="chart-row">
                <span>{item.label}</span>
                <div className="chart-bar">
                  <span
                    style={{
                      width: `${Math.round((item.value / chartMax) * 100)}%`,
                    }}
                  />
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Admin Queue</h2>
          <p className="muted">
            {requestsError || "Track approvals and jump into listing controls."}
          </p>
          <div className="approval-grid">
            <div className="approval-card">
              <span>User Requests</span>
              <strong>{pendingUsers}</strong>
              <p className="muted">Verify new user signups.</p>
              <Link className="text-link" to="/dashboard/admin/users">
                Review users →
              </Link>
            </div>
            <div className="approval-card">
              <span>Property Requests</span>
              <strong>{pendingProperties}</strong>
              <p className="muted">Approve new property listings.</p>
              <Link className="text-link" to="/dashboard/admin/properties">
                Review properties →
              </Link>
            </div>
            <div className="approval-card">
              <span>Listing Controls</span>
              <strong>Manage</strong>
              <p className="muted">Close active property listings and live auctions.</p>
              <Link className="text-link" to="/dashboard/admin/properties">
                Open controls →
              </Link>
            </div>
          </div>
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
    </AdminShell>
  );
}
