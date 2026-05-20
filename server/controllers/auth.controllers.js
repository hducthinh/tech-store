// controllers/auth.controller.js
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { validateRegisterInput } = require("../utils/validators");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Tạo JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
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

// @desc    Đăng ký tài khoản
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  // 1. Validate input
  const { isValid, errors } = validateRegisterInput(req.body);
  if (!isValid) {
    return next(new AppError(JSON.stringify(errors), 400));
  }

  const { email, password, fullName, phone } = req.body;

  // 2. Kiểm tra email đã tồn tại
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email đã được đăng ký", 400));
  }

  // 3. Kiểm tra số điện thoại đã tồn tại
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    return next(new AppError("Số điện thoại đã được đăng ký", 400));
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
