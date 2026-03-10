import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "./api.js";
import "./auth.css";

function useQueryParams() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const query = useQueryParams();
  const tokenFromQuery = query.get("token") || "";
  const emailFromQuery = query.get("email") || "";

  const [form, setForm] = useState({
    email: emailFromQuery,
    token: tokenFromQuery,
    password: "",
    confirm: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (form.password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    if (form.password !== form.confirm) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword({
        email: form.email,
        token: form.token,
        password: form.password,
      });
      setStatus({ type: "success", message: data.message || "Password updated." });
      setTimeout(() => navigate("/login", { state: { message: "Password updated. Please sign in." } }), 800);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <Link className="back-link" to="/login">
          ← Back to Login
        </Link>

        <h2>Reset Password</h2>
        <p>Create a new password for your account.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="token">Reset Token</label>
          <input
            id="token"
            name="token"
            type="text"
            placeholder="Paste the reset token"
            value={form.token}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">New Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter a new password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="Re-enter new password"
            value={form.confirm}
            onChange={handleChange}
            required
          />

          {status.message ? (
            <p className={`status ${status.type}`}>{status.message}</p>
          ) : null}

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
