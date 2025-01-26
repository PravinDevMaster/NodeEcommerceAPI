const mongoose = require("mongoose");
const { v4: uuidV4 } = require("uuid");

// create product schema
const productSchema = new mongoose.Schema(
  {
    uuid: { type: String, default: () => uuidV4() },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    vendorId: { type: String, required: true, ref: "User" },

    scheduledStartDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    delivery: {
      isFree: { type: Boolean, required: true, default: true },
      amount: { type: Number, required: true, default: 0 },
    },
    images: [{ type: String }],
    productURL: { type: String, required: false, unique: true },
    price: {
      oldPrice: { type: Number, required: true, default: 0 },
      newPrice: { type: Number, required: true, default: 0 },
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// create product model
const Product = mongoose.model("product", productSchema);
module.exports = Product;
