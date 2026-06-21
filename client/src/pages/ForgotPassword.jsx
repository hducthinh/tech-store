import React, { useState } from "react";
import { Terminal, Mail, ArrowLeft, ShieldCheck, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div id="forgot-password-container" className="min-h-screen flex flex-col justify-between font-sans bg-[#faf8ff] w-full max-w-none m-0 absolute inset-0">
      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Column branding */}
        <section className="hidden md:flex md:w-1/2 tech-gradient relative overflow-hidden flex-col justify-between p-16 text-white">
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">TechStore</h1>
          </div>

          <div className="relative z-10 max-w-md my-auto">
            <h2 className="text-5xl font-bold font-sans tracking-tight leading-[1.15] mb-6">
              Password Recovery
            </h2>
            <p className="text-lg text-white/80 leading-relaxed font-sans font-light">
              Get back online instantly. We use encrypted cryptographic keys to protect your credentials.
            </p>
          </div>

          <div className="relative z-10 glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2170e4] flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-wide">Multi-Factor Secured</p>
              <p className="text-xs text-white/75 font-mono">Automated Reset Protocol</p>
            </div>
          </div>
        </section>

        {/* Right Column Recovery */}
        <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-16 bg-[#faf8ff]">
          <div className="w-full max-w-[440px] flex flex-col gap-8">
            
            <button 
              onClick={() => navigate("/login")}
              className="group flex items-center gap-2 text-sm font-semibold text-[#0058be] hover:text-[#00236f] transition-colors cursor-pointer self-start"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quay lại Đăng nhập
            </button>

            {!submitted ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-[#1a1b21] font-sans">Quên mật khẩu?</h2>
                  <p className="text-sm text-[#444651]">
                    Nhập email tài khoản TechStore của bạn. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu trong vòng 30 giây.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#444651] flex items-center gap-1.5" htmlFor="forgot-email">
                      <Mail className="w-4 h-4 text-slate-400" />
                      Email đăng ký
                    </label>
                    <input 
                      className="w-full px-4 py-3 bg-white border border-[#c5c5d3] rounded-lg text-sm text-[#1a1b21] placeholder:text-slate-300 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] hover:border-slate-400 transition-all outline-none" 
                      id="forgot-email" 
                      placeholder="name@company.com" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button 
                    className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white rounded-lg text-sm font-semibold transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer" 
                    type="submit"
                  >
                    Gửi thiết lập lại mật khẩu
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-green-100">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#1a1b21]">Đã gửi yêu cầu thành công!</h2>
                  <p className="text-sm text-[#444651] leading-relaxed">
                    Chúng tôi đã gửi đường dẫn đặt lại mật khẩu đến hòm thư <strong className="text-slate-800">{email}</strong>. Vui lòng kiểm tra hộp thư đến hoặc thư rác.
                  </p>
                </div>

                <button 
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Trở lại Đăng nhập
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
