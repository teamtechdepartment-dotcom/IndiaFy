import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const bulkPricingSchema = new Schema(
  {
    minQty: {
      type: Number,
      required: true,
    },

    maxQty: {
      type: Number,
      required: true,
    },

    pricePerUnit: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    /* =========================================================
       CATEGORY
    ========================================================= */

    categoryName: {
      type: String,
      trim: true,
      default: "",
    },

    subCategoryId: {
      type: ObjectId,
      ref: "subCategory",
    },

    /* =========================================================
       SELLER + NODE
    ========================================================= */

    sellerId: {
      type: ObjectId,
      ref: "seller",
      required: true,
      index: true,
    },

    nodeId: {
      type: ObjectId,
      ref: "SellerNode",
      required: true,
      index: true,
    },

    nodeType: {
      type: String,

      enum: [
        "LOCAL_RETAIL",
        "WHOLESALE_B2B",
        "QUICK_COMMERCE",
        "HOME_ESSENTIALS",
        "ELECTRONICS",
        "PERSONAL_CARE",
      ],

      required: true,
    },

    /* =========================================================
       PRODUCT INFO
    ========================================================= */

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    productSkuId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================================================
       MEDIA
    ========================================================= */

    productImage: [
      {
        type: String,
      },
    ],

    thumbnail: {
      type: String,
      default: "",
    },

    /* =========================================================
       INVENTORY
    ========================================================= */

    stock: {
      type: Number,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    stockBuffer: {
      type: Number,
      default: 0,
    },

    /* =========================================================
       PRICING
    ========================================================= */

    attribute: {
      salePrice: {
        type: Number,
        required: true,
      },

      mrpPrice: {
        type: Number,
        required: true,
      },

      weight: {
        type: String,
        required: true,
      },

      quantity: {
        type: String,
        required: true,
      },
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    /* =========================================================
       WHOLESALE
    ========================================================= */

    isWholesale: {
      type: Boolean,
      default: false,
    },

    minimumOrderQty: {
      type: Number,
      default: 1,
    },

    minimumOrderValue: {
      type: Number,
      default: 0,
    },

    bulkPricing: [bulkPricingSchema],

    gstPercentage: {
      type: Number,
      default: 0,
    },

    cartonQuantity: {
      type: Number,
      default: 1,
    },

    /* =========================================================
       DISPATCH
    ========================================================= */

    dispatchSLA: {
      type: String,
      default: "24 Hours",
    },

    dispatchTiming: {
      type: String,
      default: "10:00 AM - 6:00 PM",
    },

    warehouseLocation: {
      type: String,
      default: "Primary Warehouse",
    },

    transportCategory: {
      type: String,
      default: "Bike",
    },

    packagingType: {
      type: String,
      default: "Box",
    },

    /* =========================================================
       BUSINESS
    ========================================================= */

    businessCategory: {
      type: String,
      default: "General",
    },

    /* =========================================================
       STATUS
    ========================================================= */

    isActive: {
      type: Boolean,
      default: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* =========================================================
       ANALYTICS
    ========================================================= */

    totalSales: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalViews: {
      type: Number,
      default: 0,
    },

    ratingAverage: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */

productSchema.index({
  sellerId: 1,
  nodeId: 1,
});

productSchema.index({
  categoryName: 1,
});

productSchema.index({
  productName: "text",
  description: "text",
});

const productModel = mongoose.model(
  "product",
  productSchema
);

export default productModel;