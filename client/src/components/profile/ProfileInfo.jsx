import React from "react";
import { Camera, Edit2 } from "lucide-react";

export default function ProfileInfo({ user, updateProfile }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    await updateProfile(formData);
    setIsLoading(false);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-sm">
              <div className="w-full h-full bg-[#00236f] text-white flex items-center justify-center text-3xl font-bold">
                {user?.email?.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#0058be] rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm hover:bg-[#00236f] transition">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.fullName || "Nguyễn Minh Quân"}</h2>
            <p className="text-sm text-slate-500">Thành viên từ tháng 01, 2023</p>
          </div>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
            >
              Hủy
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-[#0058be] text-white text-sm font-semibold rounded-lg hover:bg-[#00236f] transition-colors shadow-sm disabled:opacity-70"
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white text-sm font-semibold rounded-lg hover:bg-[#00236f] transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Họ và tên</p>
          {isEditing ? (
            <input 
              type="text" 
              value={formData.fullName} 
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full text-sm font-semibold text-slate-800 pb-1 border-b border-[#0058be] focus:outline-none bg-slate-50 px-2 pt-1 rounded-t"
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">{user?.fullName || "Nguyễn Minh Quân"}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Email</p>
          <p className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">{user?.email || "quan.nguyen@techstore.io"} <span className="text-[10px] ml-2 text-slate-400 font-normal">(Không thể sửa)</span></p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Số điện thoại</p>
          {isEditing ? (
            <input 
              type="text" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full text-sm font-semibold text-slate-800 pb-1 border-b border-[#0058be] focus:outline-none bg-slate-50 px-2 pt-1 rounded-t"
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">{user?.phone || "+84 987 654 321"}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Địa chỉ giao hàng</p>
          {isEditing ? (
            <input 
              type="text" 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full text-sm font-semibold text-slate-800 pb-1 border-b border-[#0058be] focus:outline-none bg-slate-50 px-2 pt-1 rounded-t"
              placeholder="Nhập địa chỉ giao hàng..."
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">
              {user?.address || "Chưa cập nhật địa chỉ giao hàng"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
