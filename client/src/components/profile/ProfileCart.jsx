import React from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileCart({ 
  cart, 
  updateQuantity, 
  removeFromCart, 
  selectedItemIds, 
  toggleItemSelection, 
  toggleAllSelection, 
  getSelectedTotal 
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-[#0058be] pl-3 flex justify-between items-center">
        <span>Giỏ hàng của bạn</span>
        {cart.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer text-sm font-normal text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <input 
              type="checkbox"
              checked={cart.length > 0 && selectedItemIds.length === cart.length}
              onChange={(e) => toggleAllSelection(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0058be] focus:ring-[#0058be]"
            />
            Chọn tất cả ({cart.length})
          </label>
        )}
      </h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="font-semibold text-slate-700 text-lg">Giỏ hàng rỗng</p>
          <p className="text-sm text-slate-400 mt-2 mb-6">Bạn chưa thêm bất cứ linh kiện chuyên nghiệp nào vào giỏ.</p>
          <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-[#0058be] text-white font-bold rounded-xl hover:bg-[#00236f] transition-colors">
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-slate-200 text-sm font-semibold text-slate-500 px-4">
            <div className="col-span-1 text-center">Chọn</div>
            <div className="col-span-5">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right">Thành tiền</div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {cart.map((item) => (
              <div key={item.product.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-150 transition-colors hover:border-[#0058be]/30">
                <div className="col-span-1 flex justify-center w-full md:w-auto self-start md:self-center">
                  <input 
                    type="checkbox"
                    checked={selectedItemIds.includes(item.product.id)}
                    onChange={() => toggleItemSelection(item.product.id)}
                    className="w-5 h-5 rounded border-slate-300 text-[#0058be] focus:ring-[#0058be] cursor-pointer"
                  />
                </div>

                <div className="col-span-5 flex items-center gap-4 w-full cursor-pointer" onClick={() => window.open(`/products/${item.product.slug || item.product.id}`, '_blank')}>
                  <div className="w-20 h-20 bg-white rounded-lg p-1.5 border border-slate-200 shrink-0">
                    <img src={item.product.image || item.product.thumbnail || "https://via.placeholder.com/300"} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 line-clamp-2 hover:text-[#0058be] transition-colors">{item.product.name}</h5>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.id); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium mt-2 flex items-center gap-1"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="col-span-2 text-center hidden md:block">
                  <span className="font-semibold text-slate-700 text-sm">{(item.product.price).toLocaleString("vi-VN")} ₫</span>
                </div>

                <div className="col-span-2 flex justify-center w-full md:w-auto">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors font-bold"
                    >-</button>
                    <span className="w-10 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-lg transition-colors font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="col-span-2 text-right w-full md:w-auto flex justify-between md:block">
                  <span className="md:hidden text-sm font-semibold text-slate-500">Thành tiền:</span>
                  <span className="font-black text-[#ba1a1a]">{(item.product.price * item.quantity).toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 mt-6 pt-6">
            <div className="w-full bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-5">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium text-base">Tổng thanh toán ({selectedItemIds.length} sản phẩm):</span>
                <span className="text-2xl font-black text-[#ba1a1a] whitespace-nowrap">{(getSelectedTotal()).toLocaleString("vi-VN")} ₫</span>
              </div>
              <button 
                disabled={selectedItemIds.length === 0}
                onClick={() => {
                  navigate("/checkout", { state: { selectedItemIds } });
                }}
                className="w-full md:w-auto px-10 py-3.5 bg-[#0058be] hover:bg-[#00236f] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                Tiến hành Thanh toán
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
