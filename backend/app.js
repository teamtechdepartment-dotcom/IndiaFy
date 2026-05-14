import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import { databaseConfig } from "./config/db.config.js";
 
// Initialize database connection
databaseConfig().catch((err) => {
  console.error("❌ Database connection failed on startup:", err);
});

import adminAuthRoutes from "./routers/admin/auth.route.js";
import customerAuthRoutes from "./routers/customer/auth.route.js";
import sellerAuthRoutes from "./routers/seller/auth.route.js";
import sellerNodeRoutes from "./routers/seller/node.route.js";
import publicStoreRoutes from "./routers/seller/public.route.js";
import productRoutes from "./routers/product/product.route.js";
import orderRoutes from "./routers/order/order.route.js";
import paymentRoutes from "./routers/payment/payment.route.js";
import customerCartRoutes from "./routers/customer/cart.route.js";
import customerProfileRoutes from "./routers/customer/profile.route.js";
import wholesaleRoutes from "./routers/wholesale/wholesale.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://india-fy.vercel.app",
  "https://indiafy.vercel.app",
];

if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach(origin => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Disable technology exposure
app.disable("x-powered-by");

// Enhanced Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.razorpay.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://images.unsplash.com",
          "https://placehold.co",
          "https://res.cloudinary.com",
        ],
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "*.vercel.app",
          "http://localhost:8000",
        ],
        frameSrc: ["https://api.razorpay.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    noSniff: true,
  }),
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Global Rate Limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 10000, // Increased for development/testing to prevent 429 errors
//     handler: (req, res) => {
//         res.status(429).json({
//             success: false,
//             message: "Too many requests from this IP, please try again later.",
//             statusCode: 429
//         });
//     }
// });
// app.use(limiter);

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Prevent HTTP parameter pollution
app.use(hpp());

// Auth Rate Limiting (Brute Force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased for development/testing
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        "Too many authentication attempts from this IP, please try again after 15 minutes.",
      statusCode: 429,
    });
  },
});

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy and active",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use("/api/v1/indiafy/admin/auth", adminAuthRoutes);
app.use("/admin/auth", adminAuthRoutes);

app.use("/api/v1/indiafy/customer/auth", customerAuthRoutes);
app.use("/customer/auth", customerAuthRoutes);

app.use("/api/v1/indiafy/seller/auth", sellerAuthRoutes);
app.use("/seller/auth", sellerAuthRoutes);

app.use("/api/v1/indiafy/seller/nodes", sellerNodeRoutes);
app.use("/seller/nodes", sellerNodeRoutes);

// Public marketplace routes (no auth required)
app.use("/api/v1/indiafy/public", publicStoreRoutes);
app.use("/public", publicStoreRoutes);

app.use("/api/v1/indiafy/products", productRoutes);
app.use("/products", productRoutes);

app.use("/api/v1/indiafy/orders", orderRoutes);
app.use("/orders", orderRoutes);

app.use("/api/v1/indiafy/payments", paymentRoutes);
app.use("/payments", paymentRoutes);

app.use("/api/v1/indiafy/customer/cart", customerCartRoutes);
app.use("/customer/cart", customerCartRoutes);

app.use("/api/v1/indiafy/customer/profile", customerProfileRoutes);
app.use("/customer/profile", customerProfileRoutes);

// Wholesale Routes
app.use("/api/v1/indiafy/wholesale", wholesaleRoutes);
app.use("/wholesale", wholesaleRoutes);

// DEV WIPE ROUTE
app.get("/api/v1/dev/wipe", async (req, res) => {
  try {
    const mongoose = await import("mongoose");
    const db = mongoose.connection.db;
    const collections = ["sellers", "products", "sellernodes", "localstores", "wholesalestores", "orders"];
    for (const name of collections) {
      try { await db.collection(name).deleteMany({}); } catch (e) {}
    }
    res.json({ message: "Seller data wiped successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  // Log the error for internal debugging
  console.error(">>> ERROR caught in Global Middleware:");
  console.error("Path:", req.path);
  console.error("Method:", req.method);
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    console.error("Body:", JSON.stringify(req.body, null, 2));
  }
  console.error("Error Detail:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let errors = err.errors || [];

  // Mongoose Validation Error handling
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    message = `Validation Error: ${messages.join(', ')}`;
    errors = messages;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found. Invalid: ${err.path}`;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
