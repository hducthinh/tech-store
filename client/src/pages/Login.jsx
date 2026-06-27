import React, { useState } from "react";
import { Terminal, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { Btn, Input } from "../components/SharedUI";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();
  
  useDocumentMeta("Đăng nhập - TechCart", "Đăng nhập hệ thống");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left panel - Image */}
      <div className="hidden lg:flex w-1/2 tech-gradient p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="z-10 cursor-pointer flex items-center gap-2" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <Terminal size={20} />
          </div>
          <span className="text-xl font-black tracking-tight">TechCart</span>
        </div>
        
        <div className="z-10 max-w-md">
          <h1 className="text-5xl font-black leading-tight mb-6">Chào mừng trở lại.</h1>
          <p className="text-blue-100 text-lg">Đăng nhập để khám phá các sản phẩm công nghệ đỉnh cao với mức giá ưu đãi nhất.</p>
        </div>

        <div className="absolute -bottom-24 -right-24 w-[120%] opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,89.1,-0.5C88.1,15.3,83.6,30.6,75.2,43.6C66.8,56.6,54.5,67.3,40.4,74.3C26.3,81.3,10.4,84.6,-4.8,82.7C-20,80.8,-34.5,73.8,-47.9,64.4C-61.3,55,-73.6,43.2,-81.1,28.7C-88.6,14.2,-91.3,-3,-88.4,-19C-85.5,-35,-77.1,-49.8,-64.5,-59.9C-51.9,-70,-35.1,-75.4,-20.1,-78C-5.1,-80.6,8.1,-80.4,22.1,-79.8" transform="translate(100 100) scale(1.1)" />
          </svg>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
        <button onClick={() => navigate("/")} className="absolute top-8 left-8 text-gray-500 hover:text-blue-600 flex items-center gap-1 font-semibold text-sm transition-colors lg:hidden">
          <ArrowLeft size={16} /> Trang chủ
        </button>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10 text-center lg:text-left">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto lg:mx-0 mb-6 lg:hidden shadow-lg shadow-blue-600/30">
              <Terminal size={24} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Đăng nhập</h2>
            <p className="text-gray-500 font-medium">Nhập email và mật khẩu của bạn để tiếp tục</p>
          </div>

          {(error || authError) && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-semibold border border-red-100">
              {error || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input 
              label="Địa chỉ Email" 
              type="email" 
              placeholder="name@example.com" 
              value={email} 
              onChange={setEmail} 
            />
            
            <div className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-900">Mật khẩu</label>
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Quên mật khẩu?</button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Btn type="submit" size="lg" className="mt-4" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Btn>
          </form>

          <p className="text-center mt-8 text-gray-500 font-medium">
            Chưa có tài khoản? <button onClick={() => navigate("/register")} className="text-blue-600 font-bold hover:underline">Đăng ký ngay</button>
          </p>
        </div>
      </div>
    </div>
  );
}
