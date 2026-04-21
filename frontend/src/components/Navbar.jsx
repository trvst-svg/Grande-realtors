import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../api.js";
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
  profileInitials,
}) {
  const navigate = useNavigate();
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("gr_token"));
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("gr_user") || "{}")
      : {};

  const derivedInitials =
    profileInitials ||
    `${storedUser.firstname?.[0] || ""}${storedUser.lastname?.[0] || ""}`.toUpperCase() ||
    storedUser.email?.[0]?.toUpperCase() ||
    "U";
  const navLinks = hasToken
    ? [...navItems, { label: "Messages", to: "/messages" }]
    : navItems;

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <header className="site-header">
      <Link className="brand" to="/home">
        Grande.
      </Link>
      <nav>
        {navLinks.map((item) => (
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
            {derivedInitials}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
