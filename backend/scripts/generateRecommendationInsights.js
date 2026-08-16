import mongoose from "mongoose";
import dotenv from "dotenv";
import { generateRecommendationInsights } from "../services/recommendationInsight.service.js";

dotenv.config();

const runBatch = async () => {
    // Parse arguments
    const args = process.argv.slice(2);
    let days = 1; // Default to previous day
    
    const daysArg = args.find(arg => arg.startsWith("--days="));
    if (daysArg) {
        days = parseInt(daysArg.split("=")[1], 10);
    }

    if (isNaN(days) || days <= 0) {
        console.error("Invalid --days parameter. Must be a positive integer.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB. Running backfill for past ${days} days...`);

        // Compute midnight boundaries
        const endDate = new Date();
        endDate.setHours(0, 0, 0, 0); // Midnight today
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - days);

        console.log(`Window: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        const snapshots = await generateRecommendationInsights({ startDate, endDate });

        console.log(`\n✅ Successfully generated ${snapshots.length} insight snapshots.`);
        snapshots.forEach(s => {
            console.log(`\nSurface: ${s.surface}`);
            console.log(`- Category Discoveries: ${s.categoryDiscoveries} / ${s.eligibleExplorationInteractions} eligible`);
            console.log(`- Exploration -> Exploitation Transitions: ${s.explorationToExploitationTransitions} / ${s.eligibleExplorationTransitions} eligible`);
        });
        
    } catch (error) {
        console.error("❌ Batch failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

runBatch();
