// server/models/brand.model.js
import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên thương hiệu là bắt buộc"],
      unique: true,
      trim: true,
      maxlength: [100, "Tên thương hiệu không được vượt quá 100 ký tự"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Mô tả không được vượt quá 500 ký tự"],
    },
    logo: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ponytail: index on slug for fast query lookups
brandSchema.index({ slug: 1 });

const Brand = mongoose.model("Brand", brandSchema, "brands");
export default Brand;
