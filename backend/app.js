import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import adminAuthRoutes from "./routes/admin.auth.routes.js";
import washerAuthRoutes from "./routes/washer.auth.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import subscriptionRoutes from "./routes/subscription.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import washerRoutes from "./routes/washer.routes.js";
import customerHistoryRoutes from "./routes/customerHistory.routes.js";
import razorpayRoutes from "./routes/razorpay.routes.js";
import billingRoutes from "./routes/billing.routes.js";

import customerSettingsRoutes from "./routes/customerSettings.routes.js";
import customerComplaintsRoutes from "./routes/customerComplaints.routes.js";
import publicSettingsRoutes from "./routes/publicSettings.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { backfillCustomerData } from "./utils/syncCustomerData.js";

const app = express();

// Security headers
app.use(helmet());

// Rate limiting — sensitive endpoints: max 100 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Automatically backfill any missing customer address/phone from existing records on start
backfillCustomerData();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://sparklewash.in",
    "https://www.sparklewash.in",
    "http://sparklewash.in",
    "http://www.sparklewash.in",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}));
// Use express.json with verify callback to capture raw body for webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));




// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/public", publicSettingsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "SparkleWash Backend Running" });
});

// Auth — rate limiter only on login/register/reset, NOT on /me or /profile
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", authLimiter, adminAuthRoutes);
app.use("/api/washer/auth", authLimiter, washerAuthRoutes);

// Customer
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/payment", paymentRoutes);

app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/customer", customerHistoryRoutes);
app.use("/api/customer", customerSettingsRoutes);
app.use("/api/customer", customerComplaintsRoutes);

// Admin (all admin routes consolidated)
app.use("/api/admin", adminRoutes);

// Washer
app.use("/api/washer", washerRoutes);

// Razorpay
app.use("/api/razorpay", razorpayRoutes);

// Billing (admin + customer + booking confirm)
app.use("/api", billingRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;