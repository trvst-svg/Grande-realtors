import Navbar from "./components/Navbar.jsx";
import "./contact.css";

export default function ContactPage() {
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
        <form>
          <div className="row">
            <input type="text" placeholder="Full Name" />
            <input type="email" placeholder="Email Address" />
          </div>
          <input type="text" placeholder="Subject" />
          <textarea rows="5" placeholder="Write your message..." />
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
}
