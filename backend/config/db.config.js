import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

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
      serverSelectionTimeoutMS: 5000, // Don't hang forever
    });
    console.log("✅Database Connect Successfully");
    return db;
  } catch (err) {
    console.error("❌ Database Connection Failed!");
    console.error("Error Message:", err.message);
    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("querySrv")
    ) {
      console.error(
        "TIP: Your network might be blocking MongoDB Atlas (SRV). Try using a direct connection string or a local MongoDB instance (e.g., mongodb://127.0.0.1:27017/indiafy).",
      );
    }
    throw err; // Re-throw so callers can retry
  }
};
