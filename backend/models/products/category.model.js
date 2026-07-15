import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    categoryImage: {
      type: String,
      required: true,
    },
    skuId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    parentId: {
      type: ObjectId,
      ref: "category",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: true,
    },
    seoTitle: {
      type: String,
      default: "",
    },
    seoDescription: {
      type: String,
      default: "",
    },
    seoKeywords: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model("category", categorySchema);

export default categoryModel;