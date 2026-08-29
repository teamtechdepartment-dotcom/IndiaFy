import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import cookieParser from "cookie-parser";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import { databaseConfig } from "./config/db.config.js";
import { seedDatabase } from "./services/seeder.service.js";
 
// NOTE: Database connection is handled in index.js with retry logic.
// Seeding is triggered after successful connection there.

import adminAuthRoutes from "./routers/admin/auth.route.js";
import adminManagementRoutes from "./routers/admin/management.route.js";
import customerAuthRoutes from "./routers/customer/auth.route.js";
import sellerAuthRoutes from "./routers/seller/auth.route.js";
import sellerNodeRoutes from "./routers/seller/node.route.js";
import sellerApplicationRoutes from "./routers/seller/application.route.js";
import publicStoreRoutes from "./routers/seller/public.route.js";
import productRoutes from "./routers/product/product.route.js";
import orderRoutes from "./routers/order/order.route.js";
import { getSellerOrders } from "./controllers/orders/order.controllers.js";
import paymentRoutes from "./routers/payment/payment.route.js";
import customerCartRoutes from "./routers/customer/cart.route.js";
import customerProfileRoutes from "./routers/customer/profile.route.js";
import interactionRoutes from "./routers/customer/interaction.route.js";
import wholesaleRoutes from "./routers/wholesale/wholesale.routes.js";
import deliveryRoutes from "./routers/delivery/delivery.route.js";
import storeApprovalRoutes from "./routers/seller/storeApproval.route.js";
import orderNotificationRoutes from "./routers/seller/orderNotification.route.js";
import { getDashboardAccess, getLatestNodeStatus } from "./controllers/sellers/node.controllers.js";
import seoRoutes from "./routers/seo/seo.route.js";
import requiredLogin from "./middlewares/requiredLogin.middleware.js";
import { requireSeller } from "./middlewares/roleGuard.middleware.js";
import { dashboardGuard } from "./middlewares/dashboardGuard.middleware.js";


const app = express();

// Trust reverse proxy (e.g., Render) to properly parse client IPs for rate-limiting
app.set("trust proxy", 1);

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
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      const isLocalhost = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
      const isDev = process.env.NODE_ENV !== "production";
      if ((isDev && isLocalhost) || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Cache-Control",
      "Pragma",
      "Expires"
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
          "https://ui-avatars.com",
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
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));



// Middlewares
app.use(compression({
  level: 6,
  threshold: 10 * 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use((req, res, next) => {
  ['body', 'params', 'headers', 'query'].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});

// Prevent HTTP parameter pollution
app.use(hpp());



// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy and active",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api/v1/indiafy/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok"
  });
});

// Routes
app.use("/", seoRoutes);
app.use("/api/v1/indiafy/admin/auth", adminAuthRoutes);
app.use("/api/v1/indiafy/admin/management", adminManagementRoutes);
app.use("/api/v1/indiafy/customer/auth", customerAuthRoutes);
app.use("/api/v1/indiafy/seller/auth", sellerAuthRoutes);
app.use("/api/v1/indiafy/seller/nodes", sellerNodeRoutes);
// app.use("/api/v1/indiafy/seller/applications", sellerApplicationRoutes);
// app.use("/api/v1/indiafy/seller/store", sellerApplicationRoutes);
app.use("/api/v1/indiafy/public", publicStoreRoutes);
app.use("/api/v1/indiafy/products", productRoutes);
app.use("/api/v1/indiafy/orders", orderRoutes);
app.get("/api/v1/indiafy/seller/orders", requiredLogin, requireSeller, dashboardGuard, getSellerOrders);
app.use("/api/v1/indiafy/payments", paymentRoutes);
app.use("/api/v1/indiafy/customer/cart", customerCartRoutes);
app.use("/api/v1/indiafy/customer/profile", customerProfileRoutes);
app.use("/api/v1/indiafy/interactions", interactionRoutes);

// Root-level route aliases
app.use("/api/orders", orderRoutes);
app.get("/api/seller/orders", requiredLogin, requireSeller, dashboardGuard, getSellerOrders);
app.use("/api/checkout", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", customerCartRoutes);
app.use("/api/customer", customerProfileRoutes);
app.use("/api/v1/indiafy/wholesale", wholesaleRoutes);
app.use("/api/v1/indiafy/seller/applications", sellerApplicationRoutes);
app.use("/api/v1/indiafy/delivery", deliveryRoutes);

app.use("/api/v1/indiafy", storeApprovalRoutes);
app.use("/api/v1/indiafy/seller/notifications", orderNotificationRoutes);
app.get("/api/v1/indiafy/seller/dashboard-access", requiredLogin, getDashboardAccess);
app.get("/api/v1/indiafy/seller/node/status", requiredLogin, getLatestNodeStatus);


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
