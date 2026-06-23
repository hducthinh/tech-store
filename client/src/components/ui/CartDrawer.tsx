import React from "react";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";

interface CartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cart: CartItem[];
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  getSubtotal: () => number;
  onProceedToCheckout: () => void;
  selectedItemIds: string[];
  toggleItemSelection: (productId: string) => void;
  toggleAllSelection: (isSelected: boolean) => void;
}

export function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  updateCartQuantity,
  removeFromCart,
  getSubtotal,
  onProceedToCheckout,
  selectedItemIds,
  toggleItemSelection,
  toggleAllSelection
}: CartDrawerProps) {
  if (!isCartOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in">
      <div 
        id="cart-drawer" 
        className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl animate-slide-in p-6 outline-none"
      >
        {/* Header drawer */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800">
            <ShoppingCart className="w-5 h-5 text-[#0058be]" />
            <h3 className="font-bold text-base font-sans">Giỏ hàng của bạn</h3>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-lg text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-2 mt-4 px-1">
            <input 
              type="checkbox"
              id="selectAllDrawer"
              checked={cart.length > 0 && selectedItemIds.length === cart.length}
              onChange={(e) => toggleAllSelection(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0058be] focus:ring-[#0058be]"
            />
            <label htmlFor="selectAllDrawer" className="text-sm text-slate-600 font-medium cursor-pointer select-none">
              Chọn tất cả
            </label>
          </div>
        )}

        {/* List items inside cart drawer */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">Giỏ hàng rỗng</p>
              <p className="text-xs text-slate-400 mt-1">Bạn chưa thêm bất cứ linh kiện chuyên nghiệp nào vào giỏ.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-150 items-center">
                
                <input 
                  type="checkbox"
                  checked={selectedItemIds.includes(item.product.id)}
                  onChange={() => toggleItemSelection(item.product.id)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0058be] focus:ring-[#0058be] cursor-pointer"
                />

                <div className="flex-1 text-left">
                  <h5 className="font-bold text-xs text-slate-800 line-clamp-2">{item.product.name}</h5>
                  <span className="text-xs text-[#ba1a1a] font-semibold block mt-1">{formatVND(item.product.price)}</span>
                  
                  {/* Quantity select inputs and indicators */}
                  <div className="flex items-center gap-2 mt-3">
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 border bg-white rounded flex items-center justify-center text-xs hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 border bg-white rounded flex items-center justify-center text-xs hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg self-start transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            ))
          )}
        </div>

        {/* Total calculation footer block inside cart */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng tiền tạm tính</span>
              <span className="text-lg font-display font-extrabold text-[#ba1a1a]">{formatVND(getSubtotal())}</span>
            </div>

            <button 
              onClick={onProceedToCheckout}
              disabled={selectedItemIds.length === 0}
              className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer text-sm"
            >
              Tiếp tục đến Thanh toán {selectedItemIds.length > 0 ? `(${selectedItemIds.length})` : ""}
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
