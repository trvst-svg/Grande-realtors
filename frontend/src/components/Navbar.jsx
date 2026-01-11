import { Link } from "react-router-dom";
import "./navbar.css";

const navItems = [
  { label: "Home", to: "/home" },
  { label: "Lands", to: "/lands" },
  { label: "Houses", to: "/houses" },
  { label: "Bidding", to: "/bidding" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar({
  showAuthActions = false,
  showProfile = false,
  profileInitials = "JD",
}) {
  return (
    <header className="site-header">
      <Link className="brand" to="/home">
        Grande.
      </Link>
      <nav>
        {navItems.map((item) => (
          <Link key={item.label} to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        {showAuthActions ? (
          <>
            <Link className="ghost" to="/login">
              Login
            </Link>
            <Link className="cta" to="/signup">
              Get Started
            </Link>
          </>
        ) : null}
        {showProfile ? (
          <Link className="profile-chip" to="/profile">
            {profileInitials}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
