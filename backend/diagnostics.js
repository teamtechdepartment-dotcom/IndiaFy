import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function run() {
  try {
    const dbUrl = process.env.MongoDb_Url || "mongodb://127.0.0.1:27017/indiafy";
    console.log("Connecting to", dbUrl);
    await mongoose.connect(dbUrl);
    console.log("Connected.");
    
    const db = mongoose.connection.db;
    const products = await db.collection("products").find({}).limit(3).toArray();
    console.log("SAMPLE PRODUCTS:", JSON.stringify(products, null, 2));
    
    const orders = await db.collection("orders").find({}).sort({createdAt: -1}).limit(2).toArray();
    console.log("RECENT ORDERS:", JSON.stringify(orders, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
