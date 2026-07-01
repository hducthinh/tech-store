import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { Btn, fmt, img } from "../SharedUI";

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cart, cartCount, updateQuantity, removeFromCart } = useCart();
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  useEffect(() => {
    if (cart?.items) {
      const allIds = cart.items.map(i => i.buildId || i.productId?._id).filter(Boolean);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedItemIds([...new Set(allIds)]);
    }
  }, [cart?.items, isOpen]);

  const toggleItemSelection = (id) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const parsedCart = React.useMemo(() => {
    if (!cart?.items) return [];
    const result = [];
    const buildMap = {};
    cart.items.forEach(item => {
      if (item.buildId) {
        if (!buildMap[item.buildId]) {
          buildMap[item.buildId] = { isBuild: true, buildId: item.buildId, items: [], totalPrice: 0 };
          result.push(buildMap[item.buildId]);
        }
        buildMap[item.buildId].items.push(item);
        buildMap[item.buildId].totalPrice += (item.productId?.price || 0) * item.quantity;
      } else {
        result.push({ isBuild: false, item });
      }
    });
    return result;
  }, [cart]);

  const removeEntireBuild = async (build) => {
    // Để xoá cả bộ, có thể phải gọi xoá từng món, nhưng do await trong vòng lặp chậm, nên ta gọi xoá nhanh.
    // Thực tế nên có api xóa theo buildId, nhưng dùng cách này cũng chạy.
    for (const item of build.items) {
      await removeFromCart(item.productId?._id, build.buildId);
    }
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={onClose}
      />

      {/* Cart Panel & Sliding Animation */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header của Giỏ hàng */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-black text-gray-900">Giỏ hàng của bạn ({cartCount})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        {/* Body (Danh sách sản phẩm) */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cartCount === 0 && <p className="text-gray-500 text-center mt-10">Giỏ hàng trống</p>}
          {parsedCart.map((group, idx) => {
            if (group.isBuild) {
              const isSelected = selectedItemIds.includes(group.buildId);
              return (
                <div key={group.buildId} className="flex flex-col gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleItemSelection(group.buildId)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      <span className="font-bold text-sm text-blue-800">Cấu Hình PC Tự Build</span>
                    </div>
                    <span className="text-red-600 font-bold text-sm">{fmt(group.totalPrice)}</span>
                  </div>
                  <div className="flex flex-col gap-2 pl-7">
                    {group.items.map((item, i) => {
                      const product = item.productId || {};
                      return (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-700">
                          <span className="truncate w-48">{product.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-gray-500">x{item.quantity}</span>
                            <button onClick={() => removeFromCart(product._id, group.buildId)} className="text-red-500 font-semibold hover:underline">Xóa</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => removeEntireBuild(group)} className="text-xs font-semibold text-red-500 hover:underline mt-1 pl-7 text-left">Xóa cả bộ cấu hình</button>
                </div>
              );
            } else {
              const item = group.item;
              const product = item.productId || {};
              const image = product.thumbnail || product.images?.[0] || "1610945415295-d9bbf067e59c";
              const isSelected = selectedItemIds.includes(product._id);
              return (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(product._id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    <img src={image.startsWith("http") || image.startsWith("data:") ? image : img(image, 200, 200)} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{product.name}</h4>
                    <span className="text-red-600 font-bold text-sm mt-auto">{fmt(product.price)}</span>
                    <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100 rounded">
                          <button type="button" onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">-</button>
                          <input 
                            type="text" 
                            value={item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") updateQuantity(product._id, "");
                              else {
                                const num = parseInt(val.replace(/\D/g, ''));
                                if (!isNaN(num)) updateQuantity(product._id, num);
                              }
                            }}
                            onBlur={() => {
                              if (item.quantity === "" || item.quantity < 1) updateQuantity(product._id, 1);
                            }}
                            className="w-8 text-center text-xs font-semibold bg-transparent border-none p-0 focus:ring-0" 
                          />
                          <button type="button" onClick={() => updateQuantity(product._id, (Number(item.quantity) || 0) + 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(product._id)} className="text-red-500 text-xs font-semibold hover:underline">Xóa</button>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Footer của Giỏ hàng */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-4 shrink-0">
          <div className="flex justify-between items-center text-sm font-bold text-gray-900">
            <span>Tổng cộng:</span>
            <span className="text-red-600 text-lg">
              {fmt(parsedCart.reduce((sum, group) => {
                if (group.isBuild && selectedItemIds.includes(group.buildId)) {
                  return sum + group.totalPrice;
                } else if (!group.isBuild && selectedItemIds.includes(group.item?.productId?._id)) {
                  return sum + (group.item?.productId?.price || group.item?.price || 0) * group.item.quantity;
                }
                return sum;
              }, 0))}
            </span>
          </div>
          <Btn size="lg" disabled={selectedItemIds.length === 0} onClick={() => { onClose(); navigate("/checkout", { state: { selectedItemIds } }); }} className="w-full justify-center rounded-full">
            Tiến hành thanh toán
          </Btn>
        </div>
      </div>
    </>
  );
}
