import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

const authSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
});

// Simulate the pre-save hook if needed, but here we'll just test the bcrypt directly
const CustomerModel = mongoose.model("customer_test", authSchema);

async function testSignup() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        console.log("Connected to DB");

        const email = "test_user_" + Date.now() + "@example.com";
        const password = "Password123";
        const salt = 12;
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("Test User Email:", email);
        console.log("Password:", password);
        console.log("Hashed Password:", hashedPassword);

        const isMatch = await bcrypt.compare(password, hashedPassword);
        console.log("Is Match:", isMatch);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

testSignup();
