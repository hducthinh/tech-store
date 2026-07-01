import React, { useState } from "react";
import { Terminal, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      } else {
        setSuccess(true);
      }
    } catch (_err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="reset-password-container" className="min-h-screen flex flex-col justify-between font-sans bg-[#faf8ff] w-full max-w-none m-0 absolute inset-0">
      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Column branding */}
        <section className="hidden md:flex md:w-1/2 tech-gradient relative overflow-hidden flex-col justify-center p-16 text-white">
          <div className="relative z-10 flex items-center gap-3 mb-auto">
            <div className="p-2 bg-white/10 rounded-lg">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">TechStore</h1>
          </div>
          <div className="relative z-10 max-w-md my-auto">
            <h2 className="text-5xl font-bold font-sans tracking-tight leading-[1.15] mb-6">
              Tạo mật khẩu mới
            </h2>
            <p className="text-lg text-white/80 leading-relaxed font-sans font-light">
              Chọn một mật khẩu mạnh để bảo vệ tài khoản TechStore của bạn.
            </p>
          </div>
        </section>

        {/* Right Column */}
        <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-16 bg-[#faf8ff]">
          <div className="w-full max-w-[440px] flex flex-col gap-8">

            {!success ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-[#1a1b21] font-sans">Đặt lại mật khẩu</h2>
                  <p className="text-sm text-[#444651]">Nhập mật khẩu mới cho tài khoản của bạn.</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="new-password">
                      <Lock className="w-4 h-4 text-slate-400" />
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-10 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-slate-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="confirm-password">
                      <Lock className="w-4 h-4 text-slate-400" />
                      Xác nhận mật khẩu
                    </label>
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-slate-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white rounded-lg text-sm font-semibold transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-green-100">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#1a1b21]">Mật khẩu đã được cập nhật!</h2>
                  <p className="text-sm text-[#444651]">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Về Đăng nhập
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
