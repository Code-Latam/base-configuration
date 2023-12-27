const mongoose = require("mongoose");


const ProductSchema = new mongoose.Schema(

  {
    clientNr: {
      type: String,
      required: true,
    },
      explorerId: {
        type: String,
        required: true,
      },
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    complianceDescription: {
      type: String,
      default: "",
    },
    sequence: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Public", "Private"],
    },
  },
  { timestamps: true }
);

ProductSchema.index({ clientNr: 1, explorerId:1,  productName: 1 }, { unique: true });
module.exports = mongoose.model("Product", ProductSchema);
