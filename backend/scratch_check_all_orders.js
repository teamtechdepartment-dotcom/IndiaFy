import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const orderSchema = new mongoose.Schema({
    customer: mongoose.Schema.Types.ObjectId,
    totalPrice: Number,
}, { timestamps: true, strict: false });

const Order = mongoose.model("Order", orderSchema);

async function checkOrders() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        const count = await Order.countDocuments();
        const all = await Order.find().limit(10);
        console.log("Total Orders in DB:", count);
        console.log("Orders:", JSON.stringify(all, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("DB Check Failed:", err.message);
        process.exit(1);
    }
}

checkOrders();
