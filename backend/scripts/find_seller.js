import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/products/product.model.js";

dotenv.config();

async function run() {
  const dbUrl = process.env.MongoDb_Url;
  if (!dbUrl) {
    console.error("❌ MongoDb_Url is not defined in .env file!");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB!");

    const product = await Product.findOne({}).lean();
    console.log("--- SAMPLE PRODUCT ---");
    console.log(JSON.stringify(product, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error running script:", err);
    process.exit(1);
  }
}

run();
