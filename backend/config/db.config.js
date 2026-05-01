import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

export const databaseConfig = async () => {
    try{
        console.log("Attempting to connect to MongoDB...");
        const db = await mongoose.connect(process.env.MongoDb_Url, {
            serverSelectionTimeoutMS: 5000, // Don't hang forever
        });
        console.log("✅Database Connect Successfully");
        return db;
    }
    catch(err){
        console.error("❌Database Connection Failed:", err.message);
        throw err; // Re-throw so callers can retry
    }
}