import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Lấy toàn bộ danh sách người dùng cho Admin
// @route   GET /api/v1/users/admin
// @access  Private/Admin
export const getAdminUsers = asyncHandler(async (req: any, res: any, next: any) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// @desc    Khóa / Mở khóa tài khoản người dùng
// @route   PATCH /api/v1/users/admin/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req: any, res: any, next: any) => {
  // Không cho phép Admin tự khóa tài khoản của chính mình
  if (req.user.id === req.params.id) {
    return next(new ApiError("Bạn không thể tự khóa tài khoản của chính mình", 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError("Không tìm thấy người dùng", 404));
  }

  // Admin chính (Super Admin) không thể bị khóa bởi Admin khác
  if (user.role === "admin" && req.user.role === "admin") {
    return next(new ApiError("Bạn không có quyền khóa tài khoản Admin khác", 403));
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    status: "success",
    message: user.isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
    data: {
      user,
    },
  });
});

