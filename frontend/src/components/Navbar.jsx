import { Link, NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";

const navItems = [
  { label: "Home", to: "/home" },
  { label: "Lands", to: "/lands" },
  { label: "Houses", to: "/houses" },
  { label: "Bidding", to: "/bidding" },
  { label: "Contact", to: "/contact" },
  { label: "EMI Calculator", to: "/emi" },
];

export default function Navbar({
  showAuthActions = false,
  showProfile = false,
  profileInitials = "JD",
}) {
  const navigate = useNavigate();
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("gr_token"));

  const handleLogout = () => {
    localStorage.removeItem("gr_token");
    localStorage.removeItem("gr_user");
    navigate("/login");
  };

  return (
    <header className="site-header">
      <Link className="brand" to="/home">
        Grande.
      </Link>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="header-actions">
        {showAuthActions && !hasToken ? (
          <>
            <Link className="ghost" to="/login">
              Login
            </Link>
            <Link className="cta" to="/signup">
              Get Started
            </Link>
          </>
        ) : null}
        {hasToken ? (
          <Link className="list-btn" to="/list-property">
            List Property
          </Link>
        ) : null}
        {hasToken ? (
          <button className="logout-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        ) : null}
        {showProfile && hasToken ? (
          <Link className="profile-chip" to="/profile">
            {profileInitials}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
