import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductModel from "../models/products/product.model.js";

dotenv.config();

const run = async () => {
    const dbUrl = process.env.MongoDb_Url || "mongodb://127.0.0.1:27017/indiafy";
    await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    const products = await ProductModel.find({});
    console.log(`Found ${products.length} products:`);
    products.forEach(p => {
        console.log(`- ID: ${p._id}, Name: ${p.productName}, stock: ${p.stock}, qty: ${p.attribute?.quantity}, sellerId: ${p.sellerId}`);
    });
    await mongoose.disconnect();
};

run().catch(console.error);
