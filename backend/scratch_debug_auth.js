import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import CustomerModel from "./models/customers/auth.model.js";
import { passwordEncryption, passwordDecryption } from "./utils/bcrypt.js";

async function runTest() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        console.log("Connected to DB");

        const email = "test_auth_" + Date.now() + "@example.com";
        const password = "Password123!";

        console.log("Creating user...");
        const customer = new CustomerModel({
            firstName: "Test",
            email: email,
            password: password
        });

        await customer.save();
        console.log("User saved.");

        // Now find the user and check password
        const foundUser = await CustomerModel.findOne({ email });
        console.log("Found user hashed password:", foundUser.password);

        const isMatch = await passwordDecryption(password, foundUser.password);
        console.log("Does the password match?", isMatch);

        // Check if double hashing occurred?
        // Let's encrypt the password once and compare manually
        const singleHash = await passwordEncryption(password);
        console.log("Single hashed password manually:", singleHash);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}
runTest();
