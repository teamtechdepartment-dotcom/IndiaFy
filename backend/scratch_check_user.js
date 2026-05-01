import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const authSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const CustomerModel = mongoose.model("customer", authSchema);

async function checkUser() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        console.log("Connected to DB");

        const email = "jsmith80769@gmail.com";
        const user = await CustomerModel.findOne({ email });

        if (user) {
            console.log("User found:", user.email);
            console.log("Hashed password:", user.password);
        } else {
            console.log("User NOT found");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUser();
