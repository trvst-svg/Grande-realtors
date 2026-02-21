import { Navigate } from "react-router-dom";

export default function AdminBlocker({ children }) {
  if (typeof window === "undefined") {
    return children;
  }
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
  } catch {
    stored = {};
  }
  if (stored.role === "admin") {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return children;
}
