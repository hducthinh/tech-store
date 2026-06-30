import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function PasswordField({ label = "Mật khẩu", placeholder = "••••••••", value, onChange, forgotPassword }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-semibold text-gray-900">{label}</label>
        {forgotPassword && (
          <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
            Quên mật khẩu?
          </Link>
        )}
      </div>
      <div className="relative">
        <input 
          type={showPassword ? "text" : "password"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none pr-10"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
