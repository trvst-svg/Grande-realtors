import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "./api.js";
import "./auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      const data = await loginUser({
        email: form.email,
        password: form.password,
      });
      setStatus({ type: "success", message: data.message || "Signed in." });
      if (data.user) {
        localStorage.setItem("gr_user", JSON.stringify(data.user));
      }
      navigate("/home");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper split">
      <div className="auth-panel">
        <div className="auth-panel-content">
          <h1 className="brand">Grande.</h1>
          <p className="panel-copy">Welcome Back to Your Real Estate Journey</p>
        </div>
      </div>

      <div className="auth-card wide">
        <Link className="back-link" to="/">
          ← Back to Home
        </Link>

        <h2>Sign In</h2>
        <p>Enter your credentials to access your account</p>

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

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="login-row">
            <label className="checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              Remember me
            </label>

            <button className="link-button" type="button">
              Forgot Password?
            </button>
          </div>

          {status.message ? (
            <p className={`status ${status.type}`}>{status.message}</p>
          ) : null}

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="footer">
          Don&apos;t have an account? <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
