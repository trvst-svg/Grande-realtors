import { Routes, Route } from "react-router-dom";
import SignupPage from "./signup.jsx";
import LoginPage from "./login.jsx";
import LandingPage from "./landing.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
