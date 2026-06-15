import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ProductModel from "./models/products/product.model.js";

async function inspectProduct() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        console.log("Connected to MongoDB successfully!");

        const product = await ProductModel.findById("6a2fd284ab06f301c91d89d5");
        console.log("Product:", JSON.stringify(product, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error("Inspection failed:", err);
    }
}

inspectProduct();
