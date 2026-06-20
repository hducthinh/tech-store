// server/models/product.model.js
import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
      maxlength: [200, "Tên sản phẩm không được vượt quá 200 ký tự"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // Rất quan trọng: Giúp thuộc tính được null nhưng nếu có giá trị thì phải là duy nhất
    },

    // Kết nối với Danh mục hàng
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Sản phẩm phải thuộc về một danh mục"],
    },
    categoryName: { type: String, required: true }, // Nhân bản tên danh mục để tối ưu tốc độ đọc
    categoryPath: { type: String },

    // Kết nối với Thương hiệu (Sửa đổi theo ý kiến bổ sung quan hệ 1:N trước đó của bạn)
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Sản phẩm phải thuộc về một thương hiệu"],
    },
    brandName: { type: String, required: true }, // Nhân bản tên thương hiệu

    // Giá cả tài chính
    price: {
      type: Number,
      required: [true, "Giá bán là bắt buộc"],
      min: [0, "Giá bán không được âm"],
    },
    originalPrice: { type: Number, min: 0 }, // Giá niêm yết cũ (để làm tính năng gạch giá giảm giá)
    costPrice: { type: Number, min: 0 }, // Giá gốc nhập kho (Dùng để Admin tính toán tỷ suất biên lợi nhuận)

    // Quản lý kho hàng
    stock: {
      type: Number,
      required: [true, "Số lượng kho là bắt buộc"],
      default: 0,
      min: [0, "Số lượng tồn kho không được nhỏ hơn 0"],
    },

    // Thông số kỹ thuật thô dưới dạng Object linh hoạt
    specs: {
      type: Map,
      of: String,
      default: {}, // Ví dụ: { "RAM": "16GB", "CPU": "M3 Pro", "Dung lượng": "512GB" }
    },

    images: {
      type: [String],
      default: [],
    },
    thumbnail: { type: String },
    description: { type: String },
    shortDescription: { type: String, maxlength: 300 },

    // Cấu hình SEO metadata phục vụ Marketing
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },
    metaKeywords: [{ type: String }],

    // Trạng thái vận hành
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }, // Sản phẩm nổi bật trang chủ
    isHot: { type: Boolean, default: false },

    // Thống kê động
    views: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 }, // Số lượng đã bán (Tự cộng dồn mỗi khi đơn hàng thành công)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    warrantyMonths: { type: Number, default: 12 },
  },
  {
    timestamps: true,
  },
);

// Bộ chỉ mục Compound Indexes và Text Indexes cực mạnh phục vụ bộ lọc tìm kiếm nâng cao ở Backend
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ categoryId: 1, price: -1, _id: 1 }); // Tối ưu bộ lọc: Chọn danh mục -> Xếp giá từ cao đến thấp
productSchema.index({ brandId: 1, soldCount: -1 }); // Tối ưu bộ lọc: Chọn hãng -> Xếp theo sản phẩm bán chạy nhất

// Text Index: Kích hoạt tính năng tìm kiếm gần đúng bằng từ khóa ở ô Search bar
productSchema.index(
  { name: "text", shortDescription: "text" },
  { weights: { name: 10, shortDescription: 2 } },
);

const Product = mongoose.model("Product", productSchema, "products");
export default Product;

