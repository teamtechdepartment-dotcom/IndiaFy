import mongoose, {Schema} from "mongoose";

const {ObjectId} = mongoose.Schema.Types;

const productSchema = new Schema({
    subCategoryId:{
        type: ObjectId,
        required: false
    },
    categoryName: {
        type: String,
        required: false
    },
    sellerId: {
        type: ObjectId,
        ref: "seller",
        required: true
    },
    nodeId: {
        type: ObjectId,
        ref: "sellerNode",
        required: false // Optional for backward compatibility with older products
    },
    nodeType: {
        type: String,
        enum: ["local", "wholesale", "quick-commerce", "home-essentials", "electronics", "personal-care"],
        default: "local"
    },
    productName:{
        type: "String",
        required: true
    },
    productSkuId:{
        type:"String",
        required: true,
        unique:true
    },
    productImage:[{
        type:"String",
        required: true
    }],
    attribute:{
        salePrice:{
            type:"String",
            required:true
        },
        mrpPrice:{
            type: "String",
            required:true
        },
        weight:{
            type:"String",
            required: true
        },
        quantity:{
            type:"String",
            required:true
        }
    },
    shortDescription:{
        type:"String",
        required: true
    },
    description:{
        type: "String",
        required: true
    },
    // --- WHOLESALE B2B EXTENSION ---
    isWholesale: {
        type: Boolean,
        default: false
    },
    minimumOrderQty: {
        type: Number,
        default: 1
    },
    minimumOrderValue: {
        type: Number,
        default: 0
    },
    bulkPricing: [{
        minQty: { type: Number, required: true },
        maxQty: { type: Number, required: true },
        pricePerUnit: { type: Number, required: true }
    }],
    gstPercentage: {
        type: Number,
        default: 0
    },
    cartonQuantity: {
        type: Number,
        default: 1
    },
    dispatchSLA: {
        type: String, // e.g. "Same Day", "24 Hours", "48 Hours"
        default: "24 Hours"
    },
    warehouseLocation: {
        type: String,
        default: "Primary Warehouse"
    },
    transportCategory: {
        type: String, // e.g. "Bike", "Mini Truck", "Tempo", "Heavy Load"
        default: "Bike"
    },
    packagingType: {
        type: String, // e.g. "Box", "Pallet", "Crate", "Bag"
        default: "Box"
    },
    stockBuffer: {
        type: Number,
        default: 0
    },
    businessCategory: {
        type: String,
        default: "General"
    },
    dispatchTiming: {
        type: String, // e.g. "10:00 AM - 6:00 PM"
        default: "10:00 AM - 6:00 PM"
    }
},
{timestamps: true}
);

productSchema.index({subCategoryId:1});

const productModel = mongoose.model("product", productSchema);

export default productModel;