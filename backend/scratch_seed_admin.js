import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import AuthModel from "./models/admins/auth.model.js";
import SecurityKeyModel from "./models/admins/securityKey.model.js";
import { passwordEncryption } from "./utils/bcrypt.js";

async function seed() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        console.log("Connected to MongoDB successfully!");

        // 1. Create security key if none exists
        let securityKey = await SecurityKeyModel.findOne({ role: "SUPER_ADMIN" });
        if (!securityKey) {
            const hashedKey = await passwordEncryption("supersecretkey123");
            securityKey = new SecurityKeyModel({
                role: "SUPER_ADMIN",
                key: hashedKey
            });
            await securityKey.save();
            console.log("Security key created for SUPER_ADMIN");
        }

        // 2. Create or update admin user
        let admin = await AuthModel.findOne({ email: "kishan12@gmail.com" });
        if (admin) {
            admin.password = "kishan1234"; // model pre-save hook hashes this
            admin.securityKeyId = securityKey._id;
            admin.role = "SUPER_ADMIN";
            await admin.save();
            console.log("Admin kishan12@gmail.com updated with password 'kishan1234'");
        } else {
            admin = new AuthModel({
                email: "kishan12@gmail.com",
                password: "kishan1234",
                firstName: "Kishan",
                lastName: "Admin",
                role: "SUPER_ADMIN",
                securityKeyId: securityKey._id
            });
            await admin.save();
            console.log("Admin kishan12@gmail.com created successfully with password 'kishan1234'");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Seeding failed:", err);
    }
}

seed();
