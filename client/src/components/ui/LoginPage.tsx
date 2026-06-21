import React, { useState } from "react";
import { Terminal, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export default function LoginPage({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }
    setError("");
    // Simulate successful login
    onLoginSuccess(email);
  };

  const handleQuickLogin = (role: "admin" | "developer") => {
    if (role === "admin") {
      setEmail("admin@techstore.vn");
      setPassword("12345678");
      onLoginSuccess("admin@techstore.vn");
    } else {
      setEmail("dev@techstore.vn");
      setPassword("12345678");
      onLoginSuccess("dev@techstore.vn");
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex flex-col justify-between font-sans bg-[#faf8ff]">
      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Column: Branding (Split 50%) - Hidden on mobile, visible on medium layouts */}
        <section id="login-left-pane" className="hidden md:flex md:w-1/2 tech-gradient relative overflow-hidden flex-col justify-between p-16 text-white">
          {/* Logo Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">TechStore</h1>
          </div>

          {/* Slogan and Text Block */}
          <div className="relative z-10 max-w-md my-auto">
            <h2 className="text-5xl font-bold font-sans tracking-tight leading-[1.15] mb-6">
              Welcome Back
            </h2>
            <p className="text-lg text-white/80 leading-relaxed font-sans font-light">
              Log in to access your professional hardware and cutting-edge tools.
            </p>
          </div>

          {/* Trusted Badge Glass Card */}
          <div id="trusted-badge" className="relative z-10 glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2170e4] flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-wide">Trusted by Professionals</p>
              <p className="text-xs text-white/75 font-mono">Secure Access Protocol Enabled</p>
            </div>
          </div>

          {/* Isometric Decorative Render (Direct Link requested by User) */}
          <div className="absolute bottom-0 right-0 w-3/4 h-1/2 opacity-25 pointer-events-none transform translate-y-6 translate-x-6">
            <img 
              className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,35,111,0.5)]"
              alt="High-tech hardware render"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBEaQsNQmkEI9OGq1zcoK4E3-tS_s4Q0o-VAhKCN-sLQwEtcUKw4Ofe-0gsvpsvGo46P6VEB3orj-CEKCuJ7v359yGkOOc5lC-Y2BHc8ZLYDoRvm0Z6lip9a4Y0knwCNVxio41ZB64lgfOP1eP6WCEKxgp9u2hImJcwe-dkwyx26YV3AhAq3UK274Ujpc9SfkFHO4yI7U0TDpo0-lBz6WNxce9BzeePV8yyWmiBB4KOq9ijckULjCbFcYvDJqDMvSsQdAyG38Dytk" 
            />
          </div>
        </section>

        {/* Right Column: Interactive Login Form (Split 50%) */}
        <section id="login-right-pane" className="flex-1 flex flex-col justify-center items-center p-6 md:p-16 bg-[#faf8ff]">
          <div className="w-full max-w-[440px] flex flex-col gap-8">
            
            {/* Mobile Logo Brand Header (Hidden on Desktop) */}
            <div id="mobile-logo" className="md:hidden flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#00236f]/10 rounded-lg">
                <Terminal className="w-7 h-7 text-[#00236f]" />
              </div>
              <h1 className="text-xl font-display font-bold tracking-tight text-[#00236f]">TechStore</h1>
            </div>

            {/* Welcome texts */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-[#1a1b21] font-sans">Đăng nhập</h2>
              <p className="text-sm text-[#444651]">Vui lòng nhập thông tin tài khoản của bạn</p>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#ba1a1a]">
                {error}
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
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
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="password">
                    <Lock className="w-4 h-4 text-slate-400" />
                    Mật khẩu
                  </label>
                  <button 
                    type="button"
                    onClick={onNavigateToForgotPassword}
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

              {/* Remember Me Box */}
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

              {/* Primary submit button */}
              <button 
                id="login-btn"
                className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white rounded-lg text-sm font-semibold transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer" 
                type="submit"
              >
                Đăng nhập
              </button>
            </form>

            {/* Social Divider */}
            <div className="space-y-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-[#c5c5d3]"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-400">Hoặc đăng nhập bằng</span>
                <div className="flex-grow border-t border-[#c5c5d3]"></div>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => onLoginSuccess("user.demo@google.com")}
                  className="flex items-center justify-center gap-2 py-2.5 px-6 bg-white border border-[#c5c5d3] hover:bg-slate-50 text-xs font-semibold text-[#444651] rounded-lg transition-all active:scale-[0.98] w-full"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.4-1.28 1.12-2.92 1.88-5.72 1.88-4.52 0-8.12-3.48-8.12-8s3.6-8 8.12-8c2.4 0 4.2 1 5.56 2.24l2.32-2.32C18.4 2.16 15.68 1 12.48 1 6.64 1 2 5.48 2 11s4.64 10 10.48 10c3.12 0 5.48-1 7.24-2.84 1.84-1.84 2.4-4.4 2.4-6.52 0-.64-.04-1.24-.12-1.72h-7.52z" fill="#EA4335"></path>
                  </svg>
                  Đăng nhập nhanh Google Demo
                </button>
              </div>
            </div>

            {/* Helper quick select test roles to make testing enjoyable */}
            <div className="p-3 bg-[#eeedf4]/60 border border-[#c5c5d3]/40 rounded-lg space-y-2">
              <p className="text-[11px] font-mono font-semibold text-[#444651] uppercase tracking-wider">Đăng ký nhanh / Trải nghiệm nhanh:</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleQuickLogin("admin")}
                  className="flex-1 py-1 text-[11px] font-medium bg-[#00236f]/10 text-[#00236f] rounded hover:bg-[#00236f]/20 transition-all"
                >
                  Tài khoản Quản trị
                </button>
                <button 
                  onClick={() => handleQuickLogin("developer")}
                  className="flex-1 py-1 text-[11px] font-medium bg-[#0058be]/10 text-[#0058be] rounded hover:bg-[#0058be]/20 transition-all"
                >
                  Tài khoản Lập trình
                </button>
              </div>
            </div>

            {/* Footer Sign-up offer */}
            <p className="text-center text-sm text-[#444651]">
              Chưa có tài khoản?{" "}
              <button 
                onClick={onNavigateToRegister}
                className="text-[#0058be] font-bold hover:underline decoration-[#0058be] decoration-2 underline-offset-4 cursor-pointer"
              >
                Đăng ký
              </button>
            </p>
          </div>
        </section>
      </main>

      {/* Footer (VN Branding Driven) */}
      <footer id="login-footer" className="bg-[#f4f3fa] border-t border-[#c5c5d3] py-4 px-6 md:px-16 w-full">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-xs text-[#444651]">
            © 2026 TechStore Inc. Tất cả quyền được bảo lưu.
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a className="text-[#444651] hover:underline" href="#privacy">Chính sách bảo mật</a>
            <a className="text-[#444651] hover:underline" href="#terms">Điều khoản dịch vụ</a>
            <a className="text-[#444651] hover:underline" href="#cookies">Cấu hình Cookies</a>
            <a className="text-[#444651] hover:underline" href="#contact">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
