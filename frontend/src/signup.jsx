import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "./api.js";
import "./auth.css";

const initialForm = {
  firstname: "",
  lastname: "",
  email: "",
  number: "",
  password: "",
  citizenshipFront: null,
  citizenshipBack: null,
  agree: false,
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!form.agree) {
      setStatus({ type: "error", message: "Please accept the terms." });
      return;
    }

    if (!form.citizenshipFront || !form.citizenshipBack) {
      setStatus({
        type: "error",
        message: "Upload both citizenship images.",
      });
      return;
    }

    const payload = new FormData();
    payload.append("firstname", form.firstname);
    payload.append("lastname", form.lastname);
    payload.append("email", form.email);
    payload.append("number", form.number);
    payload.append("password", form.password);
    payload.append("citizenshipFront", form.citizenshipFront);
    payload.append("citizenshipBack", form.citizenshipBack);

    setLoading(true);
    try {
      const data = await signupUser(payload);
      setStatus({
        type: "success",
        message: data.message || "Signup request submitted for approval.",
      });
      setForm(initialForm);
      navigate("/login", {
        state: {
          message:
            data.message ||
            "Signup request submitted. Please wait for admin approval.",
        },
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card single">
        <h1 className="brand">Grande.</h1>

        <h2>Create Your Account</h2>
        <p className="subtitle">
          Sign up to start your real estate journey with us
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div>
              <label htmlFor="firstname">First Name</label>
              <input
                id="firstname"
                name="firstname"
                type="text"
                placeholder="John"
                value={form.firstname}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="lastname">Last Name</label>
              <input
                id="lastname"
                name="lastname"
                type="text"
                placeholder="Doe"
                value={form.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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

          <label htmlFor="number">Phone Number</label>
          <input
            id="number"
            name="number"
            type="text"
            placeholder="+977 9812345678"
            value={form.number}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="citizenshipFront">Citizenship Front</label>
          <input
            id="citizenshipFront"
            name="citizenshipFront"
            type="file"
            accept="image/*"
            onChange={handleChange}
            required
          />

          <label htmlFor="citizenshipBack">Citizenship Back</label>
          <input
            id="citizenshipBack"
            name="citizenshipBack"
            type="file"
            accept="image/*"
            onChange={handleChange}
            required
          />

          <label className="checkbox">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            I agree to the <Link to="/contact">terms and conditions</Link> and{" "}
            <Link to="/contact">Privacy Policy</Link>
          </label>

          {status.message ? (
            <p className={`status ${status.type}`}>{status.message}</p>
          ) : null}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
