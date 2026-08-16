import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import SellerNode from '../models/sellerNodes/sellerNode.model.js';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/indiafy";

async function migrateLocations() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for Location Migration");

        const nodes = await SellerNode.find({});
        let updatedCount = 0;
        let skippedCount = 0;
        let invalidCount = 0;

        for (const node of nodes) {
            const lat = Number(node.latitude);
            const lng = Number(node.longitude);

            // Validate coordinates
            const isValidLat = !isNaN(lat) && lat >= -90 && lat <= 90;
            const isValidLng = !isNaN(lng) && lng >= -180 && lng <= 180;
            const isNonZero = lat !== 0 || lng !== 0; // Assuming 0,0 is default/unpopulated

            if (isValidLat && isValidLng && isNonZero) {
                // Update location field preserving GeoJSON format
                node.location = {
                    type: "Point",
                    coordinates: [lng, lat] // [longitude, latitude]
                };
                
                await node.save();
                updatedCount++;
            } else if (!isNonZero) {
                skippedCount++;
            } else {
                console.warn(`Invalid coordinates for SellerNode ${node._id}: lat=${node.latitude}, lng=${node.longitude}`);
                invalidCount++;
            }
        }

        console.log("Migration Complete:");
        console.log(`Updated Nodes: ${updatedCount}`);
        console.log(`Skipped (0,0): ${skippedCount}`);
        console.log(`Invalid Coordinates: ${invalidCount}`);

    } catch (error) {
        console.error("Migration Failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

migrateLocations();
