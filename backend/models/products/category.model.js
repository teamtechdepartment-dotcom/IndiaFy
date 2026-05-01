import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    categoryName: {
        type: "String",
        required: true,
        unique: true
    },
    categoryImage:{
        type:"String",
        required:true
    },
    skuId: {
        type: "String",
        required: true,
        unique: true
    }
},
    { timestamps: true }
)

const categoryModel = mongoose.model("category", categorySchema);

export default categoryModel;