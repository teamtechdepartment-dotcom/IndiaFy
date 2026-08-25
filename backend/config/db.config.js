import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns";

// Fix Node.js / macOS DNS resolution issues with MongoDB Atlas shard domain names
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// Connection status listeners to handle temporary network/DNS drops gracefully
mongoose.connection.on("error", (err) => {
  console.warn("⚠️ MongoDB connection event warning:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected. Auto-reconnecting...");
});
mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected successfully!");
});

export const databaseConfig = async () => {
  try {
    const dbUrl = process.env.MongoDb_Url;
    if (!dbUrl) {
      console.warn("⚠️  WARNING: process.env.MongoDb_Url is undefined!");
      console.warn("Please ensure you have configured your backend/.env file with MongoDb_Url.");
      console.warn("Falling back to local MongoDB: mongodb://127.0.0.1:27017/indiafy");
    }

    console.log("Attempting to connect to MongoDB...");
    const db = await mongoose.connect(dbUrl || "mongodb://127.0.0.1:27017/indiafy", {
      dbName: "test",
      serverSelectionTimeoutMS: 30000, // Wait up to 30s for DNS/server selection
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      family: 4, // Force IPv4 to avoid macOS DNS lookup issues
    });
    console.log("✅ Database Connect Successfully");
    return db;
  } catch (err) {
    console.error("❌ Database Connection Failed!");
    console.error("Error Message:", err.message);
    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("querySrv") ||
      err.message.includes("ENOTFOUND")
    ) {
      console.error(
        "TIP: Your network might be experiencing temporary DNS issues or blocking MongoDB Atlas (SRV).",
      );
    }
    throw err;  
  }
};
