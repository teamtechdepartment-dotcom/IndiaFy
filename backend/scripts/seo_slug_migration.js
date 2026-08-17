import mongoose from "mongoose";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

import ProductModel from "../models/products/product.model.js";

const generateSlug = (text) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove unsafe characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove duplicate hyphens
};

const runMigration = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const dbUrl = process.env.MongoDb_Url || "mongodb://127.0.0.1:27017/indiafy";
    await mongoose.connect(dbUrl);
    console.log("Connected successfully.\n");

    console.log("Fetching all products...");
    const products = await ProductModel.find({});
    console.log(`Found ${products.length} products.\n`);

    const slugRegistry = new Set();
    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // 1. Determine base slug
      let baseSlug = "";
      if (product.slug && /^[a-z0-9-]+$/.test(product.slug)) {
        baseSlug = product.slug;
      } else {
        baseSlug = generateSlug(product.productName);
        if (!baseSlug) {
            // fallback if productName is somehow empty or stripped entirely
            baseSlug = `product-${product.productSkuId || product._id.toString()}`;
        }
      }

      // 2. Resolve collisions deterministically
      let finalSlug = baseSlug;
      let counter = 2;
      while (slugRegistry.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // 3. Register the final slug
      slugRegistry.add(finalSlug);

      // 4. Update if changed
      if (product.slug !== finalSlug) {
        product.slug = finalSlug;
        await product.save();
        updatedCount++;
        console.log(`Updated: ${product._id} -> ${finalSlug}`);
      } else {
        skippedCount++;
      }
    }

    console.log(`\nMigration complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`);

    // 5. Ensure unique index on slug
    console.log("\nSyncing indexes (adding unique index on slug)...");
    
    // Check if we need to drop an old non-unique index first (Mongoose syncIndexes handles this sometimes, but we can explicitly do it via DB driver if needed)
    // We will let mongoose syncIndexes handle it if we update the model first. Let's just do it directly for safety.
    
    try {
        await mongoose.connection.collection('products').createIndex({ slug: 1 }, { unique: true });
        console.log("Unique index on 'slug' ensured.");
    } catch (indexErr) {
        console.error("Warning: Could not create unique index directly (maybe collisions still exist or index already exists).", indexErr.message);
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigration();
