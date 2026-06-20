// server/models/category.model.js
import mongoose from "mongoose";


const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      unique: true,
      trim: true,
      maxlength: [50, "Tên danh mục không vượt quá 50 ký tự"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Quan hệ đệ quy trỏ ngược lại chính bảng Category
      default: null,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 5, // Giới hạn tối đa sâu 5 cấp danh mục để tránh tải nặng hệ thống
    },
    path: {
      type: String,
      default: "", // Lưu chuỗi slug dạng "dien-tu/may-tinh/linh-kien" để Frontend render Breadcrumb siêu nhanh
    },
    description: {
      type: String,
      maxlength: [500, "Mô tả danh mục không vượt quá 500 ký tự"],
    },
    imageBanner: { type: String },
    icon: { type: String },
    displayOrder: { type: Number, default: 0 }, // Thứ tự ưu tiên hiển thị trên menu web
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// Khởi tạo các index phục vụ tìm kiếm menu nhanh
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });

const Category = mongoose.model("Category", categorySchema, "categories");
export default Category;
