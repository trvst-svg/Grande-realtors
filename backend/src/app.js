import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import landingRoutes from "./routes/landing.routes.js";
import homeRoutes from "./routes/home.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import auctionRoutes from "./routes/auction.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import contractRoutes from "./routes/contract.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

// Keep credentialed browser requests scoped to the configured frontend origin.
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Expose uploaded assets directly so the frontend can render stored media files.
app.use("/uploads/users", express.static("useruploads"));
app.use("/uploads/properties", express.static("propertyuploads"));

// Lightweight probe for local smoke tests and deployment health checks.
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/landing", landingRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/messages", messageRoutes);

app.use((err, _req, res, _next) => {
  // Normalize unhandled errors into the JSON envelope expected by the client.
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

export default app;
