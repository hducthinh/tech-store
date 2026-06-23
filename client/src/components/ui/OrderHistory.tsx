import React from "react";
import { History, CheckCircle2 } from "lucide-react";

interface OrderHistoryProps {
  orders: Order[];
  userEmail: string;
  onNavigateToCatalog: () => void;
}

export function OrderHistory({ orders, userEmail, onNavigateToCatalog }: OrderHistoryProps) {
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Lịch sử giao dịch</h3>
          <p className="text-xs text-slate-400">Xem lại các đơn hàng phần cứng chuyên dụng đã đặt của {userEmail}</p>
        </div>
        <span className="px-3 py-1 bg-[#eeedf4] border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg font-mono">
          Số đơn đặt: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
          <History className="w-12 h-12 text-slate-200" />
          <p className="text-base font-bold text-slate-700">Chưa có giao dịch nào được ghi nhận</p>
          <p className="text-xs text-slate-400">Hãy thêm một vài linh kiện tối tân vào giỏ hàng và thực hiện thanh toán mẫu.</p>
          <button 
            onClick={onNavigateToCatalog}
            className="mt-2 px-5 py-2 bg-[#0058be] text-white text-xs font-semibold rounded-lg hover:bg-[#00236f]"
          >
            Khám phá cửa hàng ngay
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div key={ord.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {/* Header đơn */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-mono">Mã đơn hàng</p>
                  <p className="text-sm font-bold text-[#00236f] font-mono">{ord.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 text-left sm:text-right">Ngày đặt</p>
                  <p className="text-xs text-slate-700 font-medium">{ord.date}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-slate-400">Trạng thái</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {ord.status}
                  </span>
                </div>
              </div>

              {/* Danh sách các item trong đơn hàng */}
              <div className="p-4 space-y-4 division-y division-slate-100">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="max-w-md">
                      <p className="font-bold text-slate-800">{item.product.name}</p>
                      <p className="text-[11px] text-slate-400 max-w-sm font-mono truncate">{item.product.specs}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">{item.quantity} x </span>
                      <span className="font-semibold text-slate-700">{formatVND(item.product.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer tổng đơn */}
              <div className="bg-slate-50/50 p-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-xs text-slate-500 max-w-md">
                  <p>📍 Giao nhận: <strong>{ord.fullName}</strong> ({ord.phone})</p>
                  <p className="truncate">🏢 Địa chỉ: {ord.address}</p>
                  <p>💳 Cổng thanh toán: {ord.paymentMethod === "BANK_TRANSFER" || ord.paymentMethod === "Bank Transfer" ? "Chuyển khoản ATM Smart Banking" : ord.paymentMethod === "COD" ? "Thanh toán lúc nhận hàng COD" : "Cổng thẻ quốc tế Visa/MasterCard"}</p>
                </div>
                <div className="text-right w-full md:w-auto">
                  <p className="text-xs text-slate-400">Tổng thanh toán</p>
                  <p className="text-lg font-display font-extrabold text-[#ba1a1a]">{formatVND(ord.total)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
