import React, { useState } from "react";
import { Terminal, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();

  useDocumentMeta("Đăng nhập", "Đăng nhập tài khoản TechStore để mua sắm thiết bị chuyên nghiệp.");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }
    setError("");
    
    const result = await login({ email, password });
    if (result.success) {
      const user = result.data?.data?.user || result.data?.user;
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };


  return (
    <div id="login-container" className="min-h-screen flex flex-col justify-between font-sans bg-[#faf8ff] w-full max-w-none m-0 absolute inset-0">
      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Column: Branding */}
        <section id="login-left-pane" className="hidden md:flex md:w-1/2 tech-gradient relative overflow-hidden flex-col justify-between p-16 text-white">
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">TechStore</h1>
          </div>

          <div className="relative z-10 max-w-md my-auto">
            <h2 className="text-5xl font-bold font-sans tracking-tight leading-[1.15] mb-6">
              Chào mừng trở lại
            </h2>
            <p className="text-lg text-white/80 leading-relaxed font-sans font-light">
              Đăng nhập để truy cập vào kho phần cứng và công cụ chuyên nghiệp.
            </p>
          </div>

          <div className="absolute bottom-0 right-0 w-3/4 h-1/2 opacity-25 pointer-events-none transform translate-y-6 translate-x-6">
            <img 
              className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,35,111,0.5)]"
              alt="High-tech hardware render"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBEaQsNQmkEI9OGq1zcoK4E3-tS_s4Q0o-VAhKCN-sLQwEtcUKw4Ofe-0gsvpsvGo46P6VEB3orj-CEKCuJ7v359yGkOOc5lC-Y2BHc8ZLYDoRvm0Z6lip9a4Y0knwCNVxio41ZB64lgfOP1eP6WCEKxgp9u2hImJcwe-dkwyx26YV3AhAq3UK274Ujpc9SfkFHO4yI7U0TDpo0-lBz6WNxce9BzeePV8yyWmiBB4KOq9ijckULjCbFcYvDJqDMvSsQdAyG38Dytk" 
            />
          </div>
        </section>

        {/* Right Column */}
        <section id="login-right-pane" className="flex-1 flex flex-col justify-center items-center p-6 md:p-16 bg-[#faf8ff]">
          <div className="w-full max-w-[440px] flex flex-col gap-8">
            
            <div id="mobile-logo" className="md:hidden flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#00236f]/10 rounded-lg">
                <Terminal className="w-7 h-7 text-[#00236f]" />
              </div>
              <h1 className="text-xl font-display font-bold tracking-tight text-[#00236f]">TechStore</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-[#1a1b21] font-sans">Đăng nhập</h2>
              <p className="text-sm text-[#444651]">Vui lòng nhập thông tin tài khoản của bạn</p>
            </div>

            {(error || authError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#ba1a1a]">
                {error || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="email">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email
                </label>
                <div className="relative group">
                  <input 
                    className="w-full px-4 py-3 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-[#cbd5e1] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none" 
                    id="email" 
                    name="email" 
                    placeholder="name@company.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onInvalid={(e) => e.target.setCustomValidity(e.target.value ? "Định dạng email không hợp lệ" : "Vui lòng nhập địa chỉ email")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="password">
                    <Lock className="w-4 h-4 text-slate-400" />
                    Mật khẩu
                  </label>
                  <button 
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs font-medium text-[#2170e4] hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative group">
                  <input 
                    className="w-full px-4 py-3 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-[#cbd5e1] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none pr-10" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onInvalid={(e) => e.target.setCustomValidity("Vui lòng nhập mật khẩu")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  className="w-4.5 h-4.5 rounded border-slate-300 text-[#0058be] focus:ring-[#3b82f6] cursor-pointer" 
                  id="remember" 
                  name="remember" 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="text-xs font-medium text-[#444651] cursor-pointer select-none" htmlFor="remember">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <button 
                id="login-btn"
                className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white rounded-lg text-sm font-semibold transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>



            <p className="text-center text-sm text-[#444651]">
              Chưa có tài khoản?{" "}
              <button 
                onClick={() => navigate("/register")}
                className="text-[#0058be] font-bold hover:underline decoration-[#0058be] decoration-2 underline-offset-4 cursor-pointer"
              >
                Đăng ký
              </button>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
