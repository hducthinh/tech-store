import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { Btn, Input } from "../../components/SharedUI";
import AuthLayout from "../../components/layouts/AuthLayout";
import PasswordField from "../../components/common/PasswordField";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();
  
  useDocumentMeta("Đăng nhập - DucThinh TechShop", "Đăng nhập hệ thống");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setError("");
    const result = await login({ email, password });
    if (result.success) {
      const user = result.data?.data?.user || result.data?.user;
      navigate(user?.role === "admin" ? "/admin" : "/");
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  return (
    <AuthLayout
      leftTitle="Chào mừng trở lại."
      leftSubtitle="Đăng nhập để khám phá các sản phẩm công nghệ đỉnh cao với mức giá ưu đãi nhất."
      rightTitle="Đăng nhập"
      rightSubtitle="Nhập email và mật khẩu của bạn để tiếp tục"
      error={error || authError}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input 
          label="Địa chỉ Email" 
          type="email" 
          placeholder="name@example.com" 
          value={email} 
          onChange={setEmail} 
        />
        
        <PasswordField
          label="Mật khẩu"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          forgotPassword={true}
        />

        <Btn type="submit" size="lg" className="mt-4" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </Btn>
      </form>

      <p className="text-center mt-8 text-gray-500 font-medium">
        Chưa có tài khoản? <button type="button" onClick={() => navigate("/register")} className="text-blue-600 font-bold hover:underline">Đăng ký ngay</button>
      </p>
    </AuthLayout>
  );
}
