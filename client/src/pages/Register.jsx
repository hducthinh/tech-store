import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { Btn, Input } from "../components/SharedUI";
import AuthLayout from "../components/layouts/AuthLayout";
import PasswordField from "../components/common/PasswordField";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError } = useAuth();
  
  useDocumentMeta("Đăng ký - DucThinh TechShop", "Đăng ký tài khoản mới");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ tất cả thông tin đăng ký.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError("");

    const result = await register({ fullName, email, phone, password, confirmPassword });
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Đăng ký thất bại");
    }
  };

  return (
    <AuthLayout
      leftTitle="Tạo tài khoản."
      leftSubtitle="Tham gia cùng hàng ngàn khách hàng khác để mua sắm thiết bị công nghệ với giá tốt nhất."
      rightTitle="Đăng ký"
      rightSubtitle="Nhập thông tin của bạn để tạo tài khoản mới"
      error={error || authError}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input 
          label="Họ và tên" 
          placeholder="Nguyễn Văn A" 
          value={fullName} 
          onChange={setFullName} 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Số điện thoại" 
            type="tel"
            placeholder="0901234567" 
            value={phone} 
            onChange={setPhone} 
          />
          <Input 
            label="Địa chỉ Email" 
            type="email" 
            placeholder="name@example.com" 
            value={email} 
            onChange={setEmail} 
          />
        </div>
        
        <PasswordField
          label="Mật khẩu"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
        />

        <PasswordField
          label="Xác nhận mật khẩu"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <label className="flex items-start gap-2 mt-2 cursor-pointer group">
          <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-gray-500 leading-tight">
            Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</a> của DucThinh TechShop.
          </span>
        </label>

        <Btn type="submit" size="lg" className="mt-4" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
        </Btn>
      </form>

      <p className="text-center mt-8 text-gray-500 font-medium">
        Đã có tài khoản? <button type="button" onClick={() => navigate("/login")} className="text-blue-600 font-bold hover:underline">Đăng nhập</button>
      </p>
    </AuthLayout>
  );
}
