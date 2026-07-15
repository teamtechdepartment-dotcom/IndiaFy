import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const cartItemSchema = new Schema({
    productId: {
        type: ObjectId,
        ref: "product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    isWholesale: {
        type: Boolean,
        default: false
    },
    gstAmount: {
        type: Number,
        default: 0
    }
});

const cartSchema = new Schema({
    customerId: {
        type: ObjectId,
        ref: "customer",
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

const Cart = mongoose.model("cart", cartSchema);
export default Cart;
