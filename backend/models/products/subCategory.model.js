import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const subCategorySchema = new Schema({
    categoryId: {
        type: ObjectId,
        required: true
    },
    subCategoryImage:{
        type:"String",
        required:true
    },
    subCategoryName: {
        type: "String",
        required: true,
        unique: true
    },
    subSkuId: {
        type: "String",
        required: true,
        unique: true
    }
},
    { timestamps: true }
);

subCategorySchema.index({categoryId:1});

const subCategoryModel = mongoose.model("sub_Category", subCategorySchema);

export default subCategoryModel;