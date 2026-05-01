import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import hpp from "hpp";

import adminAuthRoutes from "./routers/admin/auth.route.js";
import customerAuthRoutes from "./routers/customer/auth.route.js";
import sellerAuthRoutes from "./routers/seller/auth.route.js";
import productRoutes from "./routers/product/product.route.js";
import orderRoutes from "./routers/order/order.route.js";
import paymentRoutes from "./routers/payment/payment.route.js";
import customerCartRoutes from "./routers/customer/cart.route.js";
import customerProfileRoutes from "./routers/customer/profile.route.js";

const app = express();

app.use(cors({
    origin: [process.env.CORS_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Security Headers
app.use(helmet());

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
            message: "Too many authentication attempts from this IP, please try again after 15 minutes.",
            statusCode: 429
        });
    }
});

// Routes
app.use("/api/v1/indiafy/admin/auth", adminAuthRoutes);
// app.use("/api/v1/indiafy/admin/auth", authLimiter, adminAuthRoutes);
app.use("/api/v1/indiafy/customer/auth", customerAuthRoutes);
// app.use("/api/v1/indiafy/customer/auth", authLimiter, customerAuthRoutes);
app.use("/api/v1/indiafy/seller/auth", sellerAuthRoutes);
// app.use("/api/v1/indiafy/seller/auth", authLimiter, sellerAuthRoutes);
app.use("/api/v1/indiafy/products", productRoutes);
app.use("/api/v1/indiafy/orders", orderRoutes);
app.use("/api/v1/indiafy/payments", paymentRoutes);
app.use("/api/v1/indiafy/customer/cart", customerCartRoutes);
app.use("/api/v1/indiafy/customer/profile", customerProfileRoutes);
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

    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    const errors = err.errors || [];

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export default app;