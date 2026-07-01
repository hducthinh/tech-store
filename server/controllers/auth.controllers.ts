// controllers/auth.controllers.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";

// Tạo JWT token
const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError("JWT_SECRET chưa được cấu hình", 500);
  }

  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });
};

// Gửi response có token
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Xóa password khỏi response
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
};

const normalizeValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeEmail = (value) => normalizeValue(value).toLowerCase();

// @desc    Đăng ký tài khoản
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const password = normalizeValue(req.body.password);
  const fullName = normalizeValue(req.body.fullName);
  const phone = normalizeValue(req.body.phone);

  // 2. Kiểm tra email đã tồn tại
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("Email đã được đăng ký", 400));
  }

  // 3. Kiểm tra số điện thoại đã tồn tại
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    return next(new ApiError("Số điện thoại đã được đăng ký", 400));
  }

  // 4. Tạo user mới
  const newUser = await User.create({
    email,
    password,
    fullName,
    phone,
    role: "customer", // Mặc định là customer
    isActive: true,
  });

  // 5. Trả về response kèm token
  sendTokenResponse(newUser, 201, res);
});

// @desc    Đăng nhập tài khoản
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const password = normalizeValue(req.body.password);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ApiError("Email hoặc mật khẩu không đúng", 401));
  }

  if (user.isActive === false) {
    return next(new ApiError("Tài khoản đã bị khóa", 403));
  }

  const isMatch = await (user as any).comparePassword(password);
  if (!isMatch) {
    return next(new ApiError("Email hoặc mật khẩu không đúng", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Lấy thông tin tài khoản hiện tại
// @route   GET /api/v1/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return next(new ApiError("Không tìm thấy tài khoản", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// @desc    Cập nhật thông tin tài khoản hiện tại
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { fullName, phone, address } = req.body;
  
  // Ponytail: chỉ cho phép cập nhật các trường cụ thể, dùng { new: true, runValidators: true }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { fullName, phone, address },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ApiError("Không tìm thấy tài khoản", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// @desc    Gửi email đặt lại mật khẩu
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  if (!email) return next(new ApiError("Vui lòng cung cấp email", 400));

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("Email không tồn tại trong hệ thống", 404));
  }

  // Sinh token ngẫu nhiên an toàn, lưu bản băm vào DB
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "[TechStore] Đặt lại mật khẩu của bạn",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #00236f;">TechStore Pro Hardware</h2>
          <p>Xin chào <strong>${user.fullName}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiến hành:</p>
          <a href="${resetUrl}" style="display:inline-block; margin: 20px 0; padding: 12px 28px; background: #0058be; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold;">Đặt lại mật khẩu</a>
          <p style="color: #64748b; font-size: 13px;">Link này sẽ hết hạn sau <strong>10 phút</strong>. Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
        </div>
      `,
    });
  } catch (_err) {
    // Nếu gửi email thất bại, xóa token đã lưu để tránh bị khai thác
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ApiError("Không thể gửi email. Vui lòng thử lại sau.", 500));
  }

  res.status(200).json({ status: "success", message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi." });
});

// @desc    Đặt lại mật khẩu bằng token từ email
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", 400));
  }

  const { password } = req.body;
  if (!password || password.length < 6) {
    return next(new ApiError("Mật khẩu phải có ít nhất 6 ký tự", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
