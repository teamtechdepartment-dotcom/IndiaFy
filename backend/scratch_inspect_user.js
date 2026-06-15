import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import UserModel from "./models/customers/auth.model.js";

async function inspectUser() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        console.log("Connected to MongoDB successfully!");

        const user = await UserModel.findById("6a2557f7cf857699dbbcb09d");
        console.log("User:", JSON.stringify(user, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error("Inspection failed:", err);
    }
}

inspectUser();
