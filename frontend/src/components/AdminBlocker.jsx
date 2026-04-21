import { Navigate, useLocation } from "react-router-dom";

export default function AdminBlocker({ children }) {
  const location = useLocation();
  const isAuctionDetailRoute = /^\/bidding\/[^/]+$/.test(location.pathname);
  const isPropertyDetailRoute = /^\/properties\/[^/]+$/.test(location.pathname);
  const isMessagesRoute = location.pathname.startsWith("/messages");

  if (typeof window === "undefined") {
    return children;
  }
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
  } catch {
    stored = {};
  }
  if (stored.role === "admin" && !isAuctionDetailRoute && !isPropertyDetailRoute && !isMessagesRoute) {
    // Keep administrators inside the dedicated dashboard experience.
    return <Navigate to="/dashboard/admin" replace />;
  }
  if (
    stored.role === "agent" &&
    !location.pathname.startsWith("/dashboard/agent") &&
    !isAuctionDetailRoute &&
    !isPropertyDetailRoute &&
    !isMessagesRoute
  ) {
    return <Navigate to="/dashboard/agent" replace />;
  }
  return children;
}
