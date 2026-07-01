import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError("Vui lòng đăng nhập để truy cập tính năng này.", 401));
  }

  if (!process.env.JWT_SECRET) {
    return next(new ApiError("JWT_SECRET chưa được cấu hình.", 500));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.userId = decoded?.id;
    req.tokenPayload = decoded;
    return next();
  } catch (error) {
    return next(new ApiError("Token không hợp lệ hoặc đã hết hạn.", 401));
  }
};

export default verifyToken;

