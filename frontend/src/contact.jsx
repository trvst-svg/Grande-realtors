import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import "./contact.css";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus("Please fill in all fields.");
      return;
    }
    setStatus("Thanks! Your message has been recorded. We'll reach out soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">
      <Navbar showProfile />

      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>We would love to hear from you. Reach out anytime.</p>
      </section>

      <section className="contact-grid">
        <div className="contact-card">
          <h3>Visit Our Office</h3>
          <p>Grande Realtors</p>
          <p>Kalanki, Kathmandu</p>
          <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
        </div>
        <div className="contact-card">
          <h3>Call Us</h3>
          <p>+977 9812345678</p>
          <p>+977 01-5555555</p>
        </div>
        <div className="contact-card">
          <h3>Email</h3>
          <p>info@granderealtors.com</p>
          <p>support@granderealtors.com</p>
        </div>
      </section>

      <section className="contact-form">
        <h2>Send a Message</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            required
          />
          <textarea
            rows="5"
            name="message"
            placeholder="Write your message..."
            value={form.message}
            onChange={handleChange}
            required
          />
          {status ? <p className="form-status">{status}</p> : null}
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
}
