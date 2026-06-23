import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../hooks/useCart";
import { useOrders } from "../hooks/useOrders";
import StoreDashboard from "../components/ui/StoreDashboard";

export default function Checkout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedItemIds = location.state?.selectedItemIds || [];

  const { cart, setCart, getSelectedTotal } = useCart(user?.email || "");
  const {
    checkoutStep,
    setCheckoutStep,
    shippingName,
    setShippingName,
    shippingPhone,
    setShippingPhone,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    handlePlaceOrder
  } = useOrders(user?.email || "", setCart);

  const [promotionCode, setPromotionCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [createdOrderId, setCreatedOrderId] = useState("");

  // Lọc ra các item đang được chọn để thanh toán
  const selectedCartItems = cart.filter(item => selectedItemIds.includes(item.product.id));

  // Nếu không có sản phẩm nào được chọn, hoặc không đăng nhập, quay về trang chủ
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (cart.length > 0 && selectedCartItems.length === 0 && checkoutStep === 1) {
      navigate("/");
    }
  }, [user, selectedCartItems.length, cart.length, navigate, checkoutStep]);

  // Tự động điền thông tin khách hàng có sẵn
  useEffect(() => {
    if (user && !shippingName && !shippingPhone && !shippingAddress) {
      if (user.fullName) setShippingName(user.fullName);
      if (user.phone) setShippingPhone(user.phone);
      if (user.address) setShippingAddress(user.address);
    }
  }, [user, shippingName, shippingPhone, shippingAddress, setShippingName, setShippingPhone, setShippingAddress]);

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

  const getSubtotal = () => {
    return selectedCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    return (getSubtotal() * discountPercent) / 100;
  };

  const calculateTotal = () => {
    return getSubtotal() - getDiscountAmount();
  };

  const onPlaceOrder = async () => {
    const res = await handlePlaceOrder(selectedCartItems, selectedItemIds);
    if (res) {
      setCreatedOrderId(res.id);
      setCheckoutStep(3);
    }
  };

  // We wrap the checkout in StoreDashboard with activeTab="catalog" or something similar,
  // OR we can just render the standalone checkout layout.
  // The user wants a "full checkout page". Let's give them a clean checkout page 
  // with a header. But the dashboard header is nice. We can reuse the header.
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-amber-200 selection:text-amber-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0" onClick={() => navigate("/")}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#00236f] to-[#0058be] rounded-xl flex items-center justify-center shadow-md transform transition hover:rotate-12">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="font-display font-black text-lg md:text-xl text-[#00236f] tracking-tight leading-none">TechStore</h1>
              <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">Pro Hardware</p>
            </div>
          </div>
          <div className="text-lg font-bold text-slate-700 hidden sm:block">
            Thanh toán an toàn
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate("/")}
              className="text-sm font-semibold text-slate-600 hover:text-[#0058be] transition"
            >
              Hủy thanh toán
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm max-w-4xl mx-auto w-full">
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <button 
              onClick={() => {
                if (checkoutStep === 1) {
                  navigate(-1);
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
                    {selectedCartItems.map((item) => (
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

                  {/* COD Payment box */}
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
                      <p className="text-sm font-bold text-slate-800">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-slate-500 mt-1">Thanh toán bằng tiền mặt khi shipper giao hàng tới tận tay bạn.</p>
                    </div>
                  </div>

                </div>

                <button
                  onClick={onPlaceOrder}
                  className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white font-semibold text-xs rounded-lg shadow mt-6 transition uppercase"
                >
                  Xác nhận đặt hàng: {formatVND(calculateTotal())}
                </button>
              </div>

              {/* Informative side panel about chosen method */}
              <div className="bg-[#f0f4f8] rounded-xl p-5 border border-[#e2e8f0] h-fit">
                {paymentMethod === "Bank Transfer" && (
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 mb-2 border-b border-[#cbd5e1] pb-2">Hướng dẫn Chuyển khoản</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Khi nhấn <strong>Xác nhận đặt hàng</strong>, bạn sẽ được cấp một mã số đơn hàng duy nhất và tài khoản ngân hàng của TechStore. 
                      Vui lòng chuyển khoản với nội dung là mã số đơn hàng đó để chúng tôi tự động duyệt ngay lập tức.
                    </p>
                  </div>
                )}
                {paymentMethod === "COD" && (
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 mb-2 border-b border-[#cbd5e1] pb-2">Hướng dẫn nhận hàng COD</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      TechStore sẽ gửi hàng qua đối tác Giao Hàng Tiết Kiệm hoặc Viettel Post. 
                      Bạn hoàn toàn có quyền đồng kiểm (mở hộp xem hàng) trước khi trả tiền. Vui lòng chuẩn bị sẵn tiền mặt.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* CHECKOUT STEP 3: Successful final screen */}
          {checkoutStep === 3 && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Đặt hàng thành công!</h2>
              <p className="text-slate-500 text-sm mb-8 max-w-md">
                Cảm ơn bạn đã tin tưởng TechStore. Đơn hàng của bạn đang được xử lý và sẽ được giao đến trong vòng 2-4 ngày làm việc.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full max-w-sm mb-8">
                <p className="text-xs text-slate-500 mb-1 font-medium">Mã đơn hàng của bạn</p>
                <p className="text-xl font-bold tracking-widest text-[#0058be]">#{createdOrderId ? createdOrderId.substring(createdOrderId.length - 6).toUpperCase() : ""}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => navigate("/profile", { state: { openOrderId: createdOrderId } })}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition"
                >
                  Xem đơn hàng
                </button>
                <button 
                  onClick={() => navigate("/")}
                  className="px-6 py-2.5 bg-[#0058be] text-white font-bold text-sm rounded-xl hover:bg-[#00236f] transition"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
