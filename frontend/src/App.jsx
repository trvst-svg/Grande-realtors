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
import ListPropertyPage from "./list-property.jsx";
import ListAuctionPage from "./list-auction.jsx";
import AdminBlocker from "./components/AdminBlocker.jsx";
import AdminDashboard from "./admin-dashboard.jsx";
import AdminUsers from "./admin-users.jsx";
import AdminProperties from "./admin-properties.jsx";
import AgentDashboard from "./agent-dashboard.jsx";
import AgentProperties from "./agent-properties.jsx";
import UserDashboard from "./user-dashboard.jsx";
import AuctionBidPage from "./auction-bid.jsx";
import ForgotPasswordPage from "./forgot-password.jsx";
import ResetPasswordPage from "./reset-password.jsx";
import PropertyDetailsPage from "./property-details.jsx";
import EmiCalculatorPage from "./emi-calculator.jsx";

export default function App() {
  const blockAdmin = (element) => <AdminBlocker>{element}</AdminBlocker>;

  return (
    <Routes>
      <Route path="/" element={blockAdmin(<LandingPage />)} />
      <Route path="/home" element={blockAdmin(<HomePage />)} />
      <Route path="/lands" element={blockAdmin(<LandsPage />)} />
      <Route path="/houses" element={blockAdmin(<HousesPage />)} />
      <Route path="/bidding" element={blockAdmin(<BiddingPage />)} />
      <Route path="/bidding/:id" element={blockAdmin(<AuctionBidPage />)} />
      <Route path="/emi" element={blockAdmin(<EmiCalculatorPage />)} />
      <Route path="/properties/:id" element={blockAdmin(<PropertyDetailsPage />)} />
      <Route path="/contact" element={blockAdmin(<ContactPage />)} />
      <Route path="/profile" element={blockAdmin(<ProfilePage />)} />
      <Route path="/list-property" element={blockAdmin(<ListPropertyPage />)} />
      <Route
        path="/auctions/new/:propertyId"
        element={blockAdmin(<ListAuctionPage />)}
      />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/dashboard/admin/users" element={<AdminUsers />} />
      <Route path="/dashboard/admin/properties" element={<AdminProperties />} />
      <Route path="/dashboard/agent" element={blockAdmin(<AgentDashboard />)} />
      <Route
        path="/dashboard/agent/properties"
        element={blockAdmin(<AgentProperties />)}
      />
      <Route path="/dashboard/user" element={blockAdmin(<UserDashboard />)} />
      <Route path="/signup" element={blockAdmin(<SignupPage />)} />
      <Route path="/login" element={blockAdmin(<LoginPage />)} />
      <Route path="/forgot-password" element={blockAdmin(<ForgotPasswordPage />)} />
      <Route path="/reset-password" element={blockAdmin(<ResetPasswordPage />)} />
    </Routes>
  );
}
