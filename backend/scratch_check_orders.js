import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const orderSchema = new mongoose.Schema({
    customer: mongoose.Schema.Types.ObjectId,
    totalPrice: Number,
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

async function checkOrders() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        const count = await Order.countDocuments();
        const latest = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log("Total Orders:", count);
        console.log("Latest Orders:", JSON.stringify(latest, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkOrders();
