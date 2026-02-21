import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../dashboard.css";

export default function AdminShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const navClass = ({ isActive }) => (isActive ? "active" : undefined);

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!token || stored.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("gr_token");
    localStorage.removeItem("gr_user");
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span>Grande.</span>
          <p>Admin Console</p>
        </div>
        <nav className="admin-nav">
          <NavLink end to="/dashboard/admin" className={navClass}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/admin/users" className={navClass}>
            User Approvals
          </NavLink>
          <NavLink to="/dashboard/admin/properties" className={navClass}>
            Property Approvals
          </NavLink>
          <NavLink to="/home" className={navClass}>
            View Site
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
