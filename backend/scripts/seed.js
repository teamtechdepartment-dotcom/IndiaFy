import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "../services/seeder.service.js";

dotenv.config();

async function run() {
  const force = process.argv.includes("--force");
  try {
    const dbUrl = process.env.MongoDb_Url;
    if (!dbUrl) {
      console.error("❌ MongoDb_Url environment variable is not defined in .env file!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB!");

    const result = await seedDatabase(force);
    console.log("Result:", result.message);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

run();
