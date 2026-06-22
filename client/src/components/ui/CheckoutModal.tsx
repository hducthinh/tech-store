import React, { useState } from "react";
import { ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { CartItem } from "../../types";

interface CheckoutModalProps {
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  checkoutStep: number;
  setCheckoutStep: (step: number) => void;
  cart: CartItem[];
  getSubtotal: () => number;
  shippingName: string;
  setShippingName: (name: string) => void;
  shippingPhone: string;
  setShippingPhone: (phone: string) => void;
  shippingAddress: string;
  setShippingAddress: (address: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  handlePlaceOrder: (cart: CartItem[]) => void;
  setActiveTab: (tab: string) => void;
}

export function CheckoutModal({
  isCheckoutOpen,
  setIsCheckoutOpen,
  checkoutStep,
  setCheckoutStep,
  cart,
  getSubtotal,
  shippingName,
  setShippingName,
  shippingPhone,
  setShippingPhone,
  shippingAddress,
  setShippingAddress,
  paymentMethod,
  setPaymentMethod,
  handlePlaceOrder,
  setActiveTab
}: CheckoutModalProps) {
  const [promotionCode, setPromotionCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  if (!isCheckoutOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const applyPromo = () => {
    if (promotionCode === "TECHSTARTUP") {
      setDiscountPercent(15);
      setPromoSuccess("Đã áp dụng giảm giá 15%");
      setPromoError("");
    } else {
      setDiscountPercent(0);
      setPromoError("Mã không hợp lệ hoặc đã hết hạn");
      setPromoSuccess("");
    }
  };

  const getDiscountAmount = () => {
    return (getSubtotal() * discountPercent) / 100;
  };

  const calculateTotal = () => {
    return getSubtotal() - getDiscountAmount();
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm max-w-4xl mx-auto w-full">
      
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <button 
          onClick={() => {
            if (checkoutStep === 1) {
              setIsCheckoutOpen(false);
            } else if (checkoutStep === 2) {
              setCheckoutStep(1);
            }
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0058be] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <div id="checkout-steps" className="flex items-center gap-4">
          <span className={`text-xs font-extrabold flex items-center gap-1 ${checkoutStep >= 1 ? "text-[#0058be]" : "text-slate-300"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep >= 1 ? "bg-[#0058be] text-white" : "bg-slate-100 text-slate-400"}`}>1</span>
            Giao nhận
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className={`text-xs font-extrabold flex items-center gap-1  ${checkoutStep >= 2 ? "text-[#0058be]" : "text-slate-300"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep >= 2 ? "bg-[#0058be] text-white" : "bg-slate-100 text-slate-400"}`}>2</span>
            Thanh toán
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className={`text-xs font-extrabold flex items-center gap-1 ${checkoutStep >= 3 ? "text-[#0058be]" : "text-slate-300"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep >= 3 ? "bg-[#0058be] text-white" : "bg-slate-100 text-slate-400"}`}>3</span>
            Hoàn tất
          </span>
        </div>
      </div>

      {/* CHECKOUT STEP 1: Details and billing information form */}
      {checkoutStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Information form */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-[#1a1b21] mb-2 border-l-4 border-[#0058be] pl-2">Thông tin địa chỉ giao nhận</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#444651]">Họ và tên người nhận</label>
              <input 
                type="text" 
                placeholder="Nguyễn Văn A"
                required
                value={shippingName} 
                onChange={(e) => setShippingName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#444651]">Số điện thoại liên lạc</label>
              <input 
                type="tel" 
                placeholder="0901234567"
                required
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#444651]">Địa chỉ chi tiết (Số nhà, Đô thị, Tỉnh thành)</label>
              <textarea 
                placeholder="Tòa Landmark 81, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh"
                required
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>

            <button
              disabled={!shippingName || !shippingPhone || !shippingAddress}
              onClick={() => setCheckoutStep(2)}
              className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white font-semibold text-xs rounded-lg shadow disabled:opacity-40 transition uppercase"
            >
              Tiếp tục chọn hình thức thanh toán
            </button>
          </div>

          {/* Cart summary box right side */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between h-fit">
            <div>
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">Tóm tắt đơn hàng</h4>
              
              <div className="max-h-[220px] overflow-y-auto mb-4 space-y-3 pr-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-xs">
                    <div className="max-w-[70%]">
                      <p className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-slate-400 font-medium">SL: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-700">{formatVND(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Giá trị đơn</span>
                  <span>{formatVND(getSubtotal())}</span>
                </div>
                
                {/* Coupon entry */}
                <div className="pt-2 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Mã giảm giá (ví dụ: TECHSTARTUP)"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                    className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded text-xs select-all text-slate-800 placeholder-slate-400"
                  />
                  <button 
                    onClick={applyPromo}
                    type="button"
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
                
                {promoError && <p className="text-[10px] text-[#ba1a1a] font-medium">{promoError}</p>}
                {promoSuccess && <p className="text-[10px] text-emerald-600 font-semibold">{promoSuccess}</p>}

                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá ({discountPercent}%)</span>
                    <span>-{formatVND(getDiscountAmount())}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-[#ba1a1a] pt-2 border-t border-slate-100">
                  <span>Tổng cộng</span>
                  <span>{formatVND(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CHECKOUT STEP 2: Choose bank transfer, card, COD */}
      {checkoutStep === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* List dynamic options */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#1a1b21] uppercase tracking-wider mb-2">Lựa chọn cổng thanh toán</h3>

            <div className="space-y-3">
              {/* Bank transfer payment box */}
              <div 
                onClick={() => setPaymentMethod("Bank Transfer")}
                className={`p-4 border rounded-xl cursor-pointer transition flex items-start gap-3 ${paymentMethod === "Bank Transfer" ? "bg-blue-50/50 border-[#0058be]" : "bg-white border-slate-200 hover:border-slate-300"}`}
              >
                <input 
                  type="radio" 
                  name="pay" 
                  checked={paymentMethod === "Bank Transfer"}
                  onChange={() => setPaymentMethod("Bank Transfer")}
                  className="mt-1 cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Chuyển khoản ATM nội bộ (Khuyên dùng)</p>
                  <p className="text-xs text-slate-500 mt-1">Nhanh chóng, chính xác. Bạn sẽ nhận được mã giao dịch QR quét nhanh ngay lập tức.</p>
                </div>
              </div>

              {/* COD payment box */}
              <div 
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 border rounded-xl cursor-pointer transition flex items-start gap-3 ${paymentMethod === "COD" ? "bg-blue-50/50 border-[#0058be]" : "bg-white border-slate-200 hover:border-slate-300"}`}
              >
                <input 
                  type="radio" 
                  name="pay" 
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Thanh toán lúc nhận hàng (COD)</p>
                  <p className="text-xs text-slate-500 mt-1">Được kiểm tra phần cứng thiết bị trước khi thanh toán cho shipper.</p>
                </div>
              </div>

              {/* Credit Card card entry */}
              <div 
                onClick={() => setPaymentMethod("Credit Card")}
                className={`p-4 border rounded-xl cursor-pointer transition flex items-start gap-3 ${paymentMethod === "Credit Card" ? "bg-blue-50/50 border-[#0058be]" : "bg-white border-slate-200 hover:border-slate-300"}`}
              >
                <input 
                  type="radio" 
                  name="pay" 
                  checked={paymentMethod === "Credit Card"}
                  onChange={() => setPaymentMethod("Credit Card")}
                  className="mt-1 cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Cổng Thẻ Quốc Tế Visa / MasterCard / JCB</p>
                  <p className="text-xs text-slate-500 mt-1">Cổng thanh toán điện tử mã hóa an toàn đạt chuẩn PCI DSS.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlaceOrder(cart)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow transition uppercase mt-4 tracking-wide"
            >
              Xác nhận đặt đơn và ký hợp đồng giao dịch
            </button>
          </div>

          {/* Bank transfer payment instructions detail show */}
          <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-slate-800 font-sans">
            {paymentMethod === "Bank Transfer" ? (
              <div className="text-center space-y-4">
                <p className="text-xs font-bold text-[#00236f] uppercase tracking-wider">Thông tin chuyển khoản nhanh TechStore</p>
                
                <div className="p-4 bg-white rounded-lg border border-slate-200 text-left font-mono space-y-2 text-xs">
                  <p>🏦 Ngân hàng: <strong>VPBank (Việt Nam Thịnh Vượng)</strong></p>
                  <p>💼 Số tài khoản: <strong>666.0023.69999</strong></p>
                  <p>👤 Chủ tài khoản: <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ TECHSTORE VIỆT NAM</strong></p>
                  <p>💰 Số tiền cần gửi: <strong className="text-[#ba1a1a] text-sm">{formatVND(calculateTotal())}</strong></p>
                  <p>📝 Nội dung chuyển khoản: <strong className="text-[#0c4a6e]">TS CK {shippingPhone}</strong></p>
                </div>

                <div className="p-3 bg-blue-50 text-blue-800 text-[11px] rounded border border-blue-100/50 leading-relaxed text-left">
                  Hệ thống kiểm tra ngân hàng tự động phát hiện số tiền trong vòng 20 giây và chuyển tiếp đơn hàng của bạn sang chế độ <strong>"Đang giao hàng"</strong> ngay tắp lự.
                </div>
              </div>
            ) : paymentMethod === "COD" ? (
              <div className="text-left space-y-2 text-xs text-slate-600 leading-relaxed pt-2">
                 Chế độ Thanh toán khi nhận hàng (COD) cho các đơn hàng giá trị cao cần sự xác nhận bằng mã SMS gửi đến số điện thoại <strong>{shippingPhone}</strong>. Cửa hàng sẽ gọi điện kiểm tra địa chỉ trước khi điều phối bưu tá. Xin vui lòng giữ máy.
              </div>
            ) : (
              <div className="text-left space-y-4 text-xs pt-2">
                <p className="font-semibold text-slate-700">Điền thông tin Thẻ thanh toán quốc tế mẫu:</p>
                <div className="space-y-2 border border-slate-200 p-4 bg-white rounded-lg">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Số thẻ ghi nợ (Visa/Master)</label>
                    <input type="text" placeholder="4221 0045 2291 0021" className="w-full text-xs p-1.5 border border-slate-200 rounded font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Thời hạn</label>
                      <input type="text" placeholder="12/29" className="w-full text-xs p-1.5 border border-slate-200 rounded font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">CVC bảo mật</label>
                      <input type="text" placeholder="***" className="w-full text-xs p-1.5 border border-slate-200 rounded font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* CHECKOUT STEP 3: Final confirmation receipt of transaction success */}
      {checkoutStep === 3 && (
        <div className="text-center py-10 max-w-lg mx-auto space-y-6">
          <div className="w-20 h-20 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#1a1b21] font-sans">Đặt hàng thành công!</h2>
            <p className="text-sm text-slate-500">
              Cảm ơn bạn đã tin tưởng dịch vụ hạ tầng kỹ thuật chuyên sâu của TechStore. Đơn hàng của bạn đã được lập hợp đồng điện tử và chuẩn bị vận chuyển.
            </p>
          </div>

          {/* Simulated serial validation code */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-mono text-xs space-y-2">
            <p className="text-slate-400 text-center uppercase text-[10px] tracking-wider mb-2">Thông tin hóa đơn bưu cục</p>
            <p>📦 Mã tracking nội bộ: <strong>TS-TRK-{Math.floor(1000000 + Math.random() * 9000000)}</strong></p>
            <p>⚙️ Tiến độ máy chủ: <span className="bg-emerald-100 text-emerald-800 py-0.5 px-2 rounded-full font-sans font-bold text-[10px]">Đang đóng gói linh kiện</span></p>
            <p>👤 Người nhận: <strong>{shippingName}</strong> ({shippingPhone})</p>
            <p className="truncate">📍 Điểm phát: {shippingAddress}</p>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setActiveTab("history");
              }}
              className="flex-1 py-3 bg-[#eeedf4] hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition uppercase duration-200"
            >
              Xem Chi Tiết Đơn Hàng
            </button>
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setActiveTab("catalog");
              }}
              className="flex-1 py-3 bg-[#0058be] hover:bg-[#00236f] text-white font-semibold text-xs rounded-lg transition uppercase duration-200 shadow"
            >
              Tiếp tục mua hàng
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
