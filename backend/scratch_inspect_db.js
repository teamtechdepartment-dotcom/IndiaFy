import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import AuthModel from "./models/admins/auth.model.js";
import SecurityKeyModel from "./models/admins/securityKey.model.js";

async function inspect() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        console.log("Connected to MongoDB successfully!");

        const admins = await AuthModel.find({});
        console.log("Existing admins in DB:", admins.map(a => ({ email: a.email, role: a.role, securityKeyId: a.securityKeyId })));

        const keys = await SecurityKeyModel.find({});
        console.log("Existing security keys in DB:", keys);

        await mongoose.disconnect();
    } catch (err) {
        console.error("Inspection failed:", err);
    }
}

inspect();
