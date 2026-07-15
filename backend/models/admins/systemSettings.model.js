import mongoose, { Schema } from "mongoose";

const systemSettingsSchema = new Schema(
  {
    brandName: {
      type: String,
      default: "Indiafy",
    },
    logoUrl: {
      type: String,
      default: "/Images/logo.png",
    },
    faviconUrl: {
      type: String,
      default: "/favicon.ico",
    },
    contactDetails: {
      email: { type: String, default: "support@indiafy.com" },
      phone: { type: String, default: "+91 80 4719 1000" },
      address: { type: String, default: "Gurugram, Haryana, India" },
      socialLinks: {
        twitter: { type: String, default: "https://twitter.com/indiafy" },
        facebook: { type: String, default: "https://facebook.com/indiafy" },
        instagram: { type: String, default: "https://instagram.com/indiafy" },
      },
    },
    payments: {
      razorpayActive: { type: Boolean, default: true },
      stripeActive: { type: Boolean, default: false },
      paypalActive: { type: Boolean, default: false },
      razorpayKey: { type: String, default: "" },
      razorpaySecret: { type: String, default: "" },
      stripeWebhookSecret: { type: String, default: "" },
    },
    email: {
      smtpHost: { type: String, default: "smtp.brevo.com" },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: "" },
      smtpPass: { type: String, default: "" },
      templates: {
        welcome: { type: String, default: "Welcome to Indiafy! We are excited to have you." },
        orderShipped: { type: String, default: "Your order has been shipped and is on the way." },
        alert: { type: String, default: "Security notification: password updated or login detected." },
      },
    },
    security: {
      passwordMinLength: { type: Number, default: 8 },
      require2FA: { type: Boolean, default: false },
      sessionTimeoutMinutes: { type: Number, default: 30 },
      ipWhitelist: [
        {
          type: String,
        },
      ],
    },
    commissions: {
      globalRate: { type: Number, default: 5.0 }, // default 5% commission
      categoryRates: {
        type: Map,
        of: Number,
        default: new Map([
          ["Grocery", 3.0],
          ["Fashion", 8.0],
          ["Electronics", 4.0],
          ["Beauty", 7.0],
        ]),
      },
    },
  },
  { timestamps: true }
);

// We only want a single settings document in the database
const SystemSettings = mongoose.model("system_Settings", systemSettingsSchema);

export default SystemSettings;
