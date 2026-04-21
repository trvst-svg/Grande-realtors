import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../api.js";
import "../dashboard.css";

export default function AgentShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const navClass = ({ isActive }) => (isActive ? "active" : undefined);

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!token || stored.role !== "agent") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span>Grande.</span>
          <p>Sales Handler Console</p>
        </div>
        <nav className="admin-nav">
          <NavLink end to="/dashboard/agent" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/agent/properties" className={navClass}>
            Property Requests
          </NavLink>
          <NavLink to="/dashboard/agent/assigned-properties" className={navClass}>
            Assigned Properties
          </NavLink>
        </nav>
        <div className="admin-actions">
          <button className="logout-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="admin-hero">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </section>

      <main className="admin-content">{children}</main>
    </div>
  );
}
