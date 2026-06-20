// controllers/auth.controllers.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../utils/validators.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// Tạo JWT token
const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET chưa được cấu hình", 500);
  }

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

const normalizeValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeEmail = (value) => normalizeValue(value).toLowerCase();

const getFirstErrorMessage = (errors) =>
  Object.values(errors || {})[0] || "Dữ liệu không hợp lệ";

// @desc    Đăng ký tài khoản
// @route   POST /api/v1/auth/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  // 1. Validate input
  const { isValid, errors } = validateRegisterInput(req.body);
  if (!isValid) {
    return next(new AppError(getFirstErrorMessage(errors), 400, errors));
  }

  const email = normalizeEmail(req.body.email);
  const password = normalizeValue(req.body.password);
  const fullName = normalizeValue(req.body.fullName);
  const phone = normalizeValue(req.body.phone);

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

// @desc    Đăng nhập tài khoản
// @route   POST /api/v1/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { isValid, errors } = validateLoginInput(req.body);
  if (!isValid) {
    return next(new AppError(getFirstErrorMessage(errors), 400, errors));
  }

  const email = normalizeEmail(req.body.email);
  const password = normalizeValue(req.body.password);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Email hoặc mật khẩu không đúng", 401));
  }

  if (user.isActive === false) {
    return next(new AppError("Tài khoản đã bị khóa", 403));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError("Email hoặc mật khẩu không đúng", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Lấy thông tin tài khoản hiện tại
// @route   GET /api/v1/auth/profile
// @access  Private
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return next(new AppError("Không tìm thấy tài khoản", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
