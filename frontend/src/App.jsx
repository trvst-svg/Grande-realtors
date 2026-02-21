import { Routes, Route } from "react-router-dom";
import SignupPage from "./signup.jsx";
import LoginPage from "./login.jsx";
import LandingPage from "./landing.jsx";
import HomePage from "./home.jsx";
import LandsPage from "./lands.jsx";
import HousesPage from "./houses.jsx";
import BiddingPage from "./bidding.jsx";
import ContactPage from "./contact.jsx";
import ProfilePage from "./profile.jsx";
import AdminDashboard from "./admin-dashboard.jsx";
import AdminUsers from "./admin-users.jsx";
import AdminProperties from "./admin-properties.jsx";
import AgentDashboard from "./agent-dashboard.jsx";
import UserDashboard from "./user-dashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/lands" element={<LandsPage />} />
      <Route path="/houses" element={<HousesPage />} />
      <Route path="/bidding" element={<BiddingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/dashboard/admin/users" element={<AdminUsers />} />
      <Route path="/dashboard/admin/properties" element={<AdminProperties />} />
      <Route path="/dashboard/agent" element={<AgentDashboard />} />
      <Route path="/dashboard/user" element={<UserDashboard />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
