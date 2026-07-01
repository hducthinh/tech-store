import ApiError from "../utils/ApiError.js";

export const validateRequest = (validator) => (req: any, res: any, next: any) => {
  const { isValid, errors } = validator(req.body);
  if (!isValid) {
    const firstError = Object.values(errors)[0] || "Dữ liệu không hợp lệ";
    return next(new ApiError(firstError, 400, errors));
  }
  next();
};

