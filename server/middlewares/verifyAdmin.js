import User from "../models/user.model.js";
import AppError from "../utils/appError.js";

const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return next(new AppError("Không tìm thấy người dùng.", 404));
    }

    if (user.role !== "admin") {
      return next(new AppError("Truy cập bị từ chối. Chỉ dành cho Quản trị viên.", 403));
    }

    // Đính kèm toàn bộ thông tin user (nếu cần thiết cho các middleware sau)
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyAdmin;
