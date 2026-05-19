// server/models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Định dạng email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải chứa ít nhất 6 ký tự"],
      select: false, // Bảo mật: Không tự động trả về mật khẩu khi thực hiện câu lệnh tìm kiếm thông thường
    },
    fullName: {
      type: String,
      required: [true, "Họ và tên là bắt buộc"],
      trim: true,
      maxlength: [100, "Họ và tên không được vượt quá 100 ký tự"],
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      match: [/^[0-9]{10,11}$/, "Số điện thoại phải chứa từ 10 đến 11 chữ số"],
    },
    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer", // Mặc định đăng ký mới là tài khoản khách hàng
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true, // Tự động đẻ ra 2 trường: createdAt và updatedAt để theo dõi thời gian biến động dữ liệu
  },
);

// Tạo bộ chỉ mục tìm kiếm nhanh tài khoản qua email
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema, "users");
module.exports = User;
