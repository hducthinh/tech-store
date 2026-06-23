import React, { useState } from "react";
import { Terminal, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError } = useAuth();

  useDocumentMeta("Đăng ký tài khoản", "Đăng ký thành viên TechStore để tham gia cộng đồng Developer Việt Nam.");

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

    // The backend validation expects fullName, email, phone, password, and confirmPassword
    const result = await register({ fullName, email, phone, password, confirmPassword });
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Đăng ký thất bại");
    }
  };

  return (
    <div id="register-container" className="min-h-screen flex flex-col justify-between font-sans bg-[#faf8ff] w-full max-w-none m-0 absolute inset-0">
      <main className="flex-1 flex flex-col md:flex-row min-h-0">

        {/* Left Column: Branding (Split 50%) - Shared visual */}
        <section id="register-left" className="hidden md:flex md:w-1/2 tech-gradient relative overflow-hidden flex-col justify-between p-16 text-white">
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">TechStore</h1>
          </div>

          <div className="relative z-10 max-w-md my-auto">
            <h2 className="text-5xl font-bold font-sans tracking-tight leading-[1.15] mb-6">
              Tạo tài khoản
            </h2>
            <p className="text-lg text-white/80 leading-relaxed font-sans font-light">
              Tham gia cùng đội ngũ kỹ sư hệ thống và nhà phát triển hàng đầu Việt Nam để sở hữu thiết bị chuyên nghiệp.
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

        {/* Right Column: Register Form */}
        <section id="register-right" className="flex-1 flex flex-col justify-center items-center p-6 md:p-16 bg-[#faf8ff]">
          <div className="w-full max-w-[440px] flex flex-col gap-8">

            <div className="md:hidden flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#00236f]/10 rounded-lg">
                <Terminal className="w-7 h-7 text-[#00236f]" />
              </div>
              <h1 className="text-xl font-display font-bold tracking-tight text-[#00236f]">TechStore</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-[#1a1b21] font-sans">Đăng ký tài khoản</h2>
            </div>

            {(error || authError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#ba1a1a]">
                {error || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="fullName">
                  <User className="w-4 h-4 text-slate-400" />
                  Họ và tên
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-slate-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none"
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  required
                  minLength="2"
                  maxLength="100"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onInvalid={(e) => e.target.setCustomValidity("Vui lòng nhập họ và tên (từ 2-100 ký tự)")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="reg-phone">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Số điện thoại
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-slate-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none"
                  id="reg-phone"
                  placeholder="0901234567"
                  required
                  pattern="[0-9]{10}"
                  title="Số điện thoại phải chứa 10 chữ số"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onInvalid={(e) => e.target.setCustomValidity(e.target.value ? "Số điện thoại không hợp lệ (phải gồm 10 chữ số)" : "Vui lòng nhập số điện thoại")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="reg-email">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Địa chỉ Email
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-slate-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none"
                  id="reg-email"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInvalid={(e) => e.target.setCustomValidity(e.target.value ? "Định dạng email không hợp lệ" : "Vui lòng nhập địa chỉ email")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="reg-password">
                  <Lock className="w-4 h-4 text-slate-400" />
                  Mật khẩu
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-slate-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none"
                  id="reg-password"
                  placeholder="••••••••"
                  required
                  minLength="6"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInvalid={(e) => e.target.setCustomValidity(e.target.value ? "Mật khẩu phải chứa ít nhất 6 ký tự" : "Vui lòng nhập mật khẩu")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="reg-confirm-password">
                  <Lock className="w-4 h-4 text-slate-400" />
                  Xác nhận mật khẩu
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-slate-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none"
                  id="reg-confirm-password"
                  placeholder="••••••••"
                  required
                  minLength="6"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onInvalid={(e) => e.target.setCustomValidity(e.target.value ? "Xác nhận mật khẩu phải chứa ít nhất 6 ký tự" : "Vui lòng xác nhận mật khẩu")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-[#0058be] focus:ring-[#3b82f6] cursor-pointer"
                  id="terms"
                  required
                  type="checkbox"
                />
                <label className="text-xs text-[#444651] cursor-pointer" htmlFor="terms">
                  Tôi đồng ý với <a href="#terms-link" className="text-[#0058be] hover:underline">Chính sách Bảo mật</a> và <a href="#terms-link" className="text-[#0058be] hover:underline">Điều khoản Sử dụng</a> của TechStore.
                </label>
              </div>

              <button
                className="w-full py-3 mt-2 bg-[#0058be] hover:bg-[#00236f] text-white rounded-lg text-sm font-semibold transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký thành viên"}
              </button>
            </form>

            <p className="text-center text-sm text-[#444651]">
              Đã có tài khoản?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#0058be] font-bold hover:underline decoration-[#0058be] decoration-2 underline-offset-4 cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
