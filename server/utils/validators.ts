const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,11}$/;

const normalizeValue = (value) =>
  typeof value === "string" ? value.trim() : "";

export const validateRegisterInput = (data: any = {}) => {
  const errors: any = {};

  const email = normalizeValue(data.email);
  const password = normalizeValue(data.password);
  const confirmPassword = normalizeValue(data.confirmPassword);
  const fullName = normalizeValue(data.fullName);
  const phone = normalizeValue(data.phone);

  if (!fullName) {
    errors.fullName = "Họ và tên là bắt buộc";
  } else if (fullName.length > 100) {
    errors.fullName = "Họ và tên không được vượt quá 100 ký tự";
  }

  if (!email) {
    errors.email = "Email là bắt buộc";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Định dạng email không hợp lệ";
  }

  if (!phone) {
    errors.phone = "Số điện thoại là bắt buộc";
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = "Số điện thoại phải chứa từ 10 đến 11 chữ số";
  }

  if (!password) {
    errors.password = "Mật khẩu là bắt buộc";
  } else if (password.length < 6) {
    errors.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const validateLoginInput = (data: any = {}) => {
  const errors: any = {};

  const email = normalizeValue(data.email);
  const password = normalizeValue(data.password);

  if (!email) {
    errors.email = "Email là bắt buộc";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Định dạng email không hợp lệ";
  }

  if (!password) {
    errors.password = "Mật khẩu là bắt buộc";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};
