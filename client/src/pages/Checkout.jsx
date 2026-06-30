import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, Banknote, MapPin } from "lucide-react";
import UserLayout from "../components/layouts/UserLayout";
import { fmt, img, Btn, Input, Card } from "../components/SharedUI";
import { Skeleton } from "../components/ui/Skeleton";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import api from "../services/api";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const { cart, cartCount, fetchCart, loading: isCartLoading } = useCart();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
    note: ""
  });
  
  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isPaymentReceived, setIsPaymentReceived] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 3 && orderInfo?.paymentMethod === 'BANK_TRANSFER' && !isPaymentReceived) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/orders/${orderInfo._id}`);
          if (res.data?.data?.order?.isPaid) {
            setIsPaymentReceived(true);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Lỗi kiểm tra thanh toán:", error);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, orderInfo, isPaymentReceived]);
  
  const stateSelectedIds = location.state?.selectedItemIds || [];
  const allCartItems = cart?.items || [];
  const cartItems = stateSelectedIds.length > 0 
    ? allCartItems.filter(item => {
        if (item.buildId && stateSelectedIds.includes(item.buildId)) return true;
        return stateSelectedIds.includes(item.productId?._id || item.product?.id);
      })
    : allCartItems;
  const selectedItemIds = cartItems.map(item => item._id || item.id).filter(Boolean);

  const subtotal = cartItems.reduce((acc, curr) => {
    const price = curr.price || curr.productId?.price || 0;
    return acc + price * curr.quantity;
  }, 0);
  const discount = discountApplied ? subtotal * 0.1 : 0; 
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "TECH10") {
      setDiscountApplied(true);
    } else {
      setDiscountApplied(false);
      showAlert("Mã giảm giá không hợp lệ. Gợi ý: TECH10", "error");
    }
  };

  const handleCheckout = async () => {
    if (selectedItemIds.length === 0) return showAlert("Giỏ hàng trống!", "error");
    try {
      setLoading(true);
      const payload = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address
        },
        paymentMethod,
        selectedItemIds
      };
      const response = await api.post("/orders", payload);
      setOrderInfo(response.data?.data?.order);
      await fetchCart();
      // Xóa cấu hình PC Builder nếu có
      localStorage.removeItem("pc_builder_config");
      setStep(3);
    } catch (error) {
      showAlert("Lỗi khi đặt hàng: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  useDocumentMeta("Thanh toán - DucThinh TechShop", "Tiến hành thanh toán đơn hàng");

  return (
    <UserLayout cartCount={cartCount}>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          
          {/* Steps Indicator */}
          <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
            {[
              { num: 1, label: "Giao hàng" },
              { num: 2, label: "Thanh toán" },
              { num: 3, label: "Hoàn tất" }
            ].map((s, index, array) => {
              const isCompleted = step === 3 && (orderInfo?.paymentMethod !== 'BANK_TRANSFER' || isPaymentReceived);
              const isActive = step >= s.num && (s.num !== 3 || isCompleted);
              const isChecked = step > s.num || (s.num === 3 && isCompleted);

              return (
                <React.Fragment key={s.num}>
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                      {isChecked ? <CheckCircle2 size={20} /> : s.num}
                    </div>
                    <span className={`text-xs font-bold absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{s.label}</span>
                  </div>
                  {index < array.length - 1 && (
                    <div className="flex-1 h-1 -mx-1 z-0 rounded-full transition-colors relative">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        (step > s.num) || (s.num === 2 && isCompleted) ? 'bg-blue-600 w-full' : 'bg-gray-200 w-full'
                      }`}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {step === 1 && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <MapPin className="text-blue-600" /> Thông tin giao hàng
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Họ và tên" placeholder="Nhập họ tên người nhận" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                      <Input label="Số điện thoại" placeholder="Nhập số điện thoại" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                      <div className="md:col-span-2">
                        <Input label="Địa chỉ email" type="email" placeholder="Nhập email để nhận hóa đơn" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <Input label="Địa chỉ chi tiết" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Ghi chú đơn hàng (Tùy chọn)</label>
                        <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none min-h-[80px]" placeholder="Ghi chú thêm về thời gian nhận hàng..." value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}></textarea>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 font-semibold text-sm flex items-center gap-1 transition-colors">
                      <ArrowLeft size={16} /> Quay lại giỏ hàng
                    </button>
                    <Btn size="lg" onClick={() => setStep(2)}>Tiếp tục thanh toán</Btn>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <CreditCard className="text-blue-600" /> Phương thức thanh toán
                    </h2>
                    <div className="flex flex-col gap-4">
                      <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">Chuyển khoản ngân hàng (Mã QR)</p>
                          <p className="text-sm text-gray-500 mt-1">Quét mã QR qua ứng dụng ngân hàng. Nhanh chóng và an toàn.</p>
                        </div>
                        <CreditCard className={paymentMethod === 'BANK_TRANSFER' ? 'text-blue-600' : 'text-gray-400'} />
                      </label>
                      <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                          <p className="text-sm text-gray-500 mt-1">Thanh toán bằng tiền mặt khi shipper giao hàng tận nơi.</p>
                        </div>
                        <Banknote className={paymentMethod === 'COD' ? 'text-blue-600' : 'text-gray-400'} />
                      </label>
                    </div>
                  </Card>
                  
                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep(1)} className="text-gray-500 hover:text-blue-600 font-semibold text-sm flex items-center gap-1 transition-colors">
                      <ArrowLeft size={16} /> Quay lại
                    </button>
                    <Btn size="lg" onClick={handleCheckout} disabled={loading}>{loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}</Btn>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500 bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                  {orderInfo?.paymentMethod === 'BANK_TRANSFER' && !isPaymentReceived ? (
                    <>
                      <p className="text-gray-500 mb-6 max-w-md text-sm">
                        Bạn có thể đợi sau khi chuyển khoản hoặc thoát ra và có thể kiểm tra trong phần <span className="font-semibold text-blue-600">Lịch sử đơn hàng ➔ Xem chi tiết</span>.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={48} />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 mb-4">
                        {orderInfo?.paymentMethod === 'BANK_TRANSFER' ? "Thanh toán thành công!" : "Đặt hàng thành công!"}
                      </h2>
                      <p className="text-gray-500 mb-8 max-w-md">
                        {orderInfo?.paymentMethod === 'BANK_TRANSFER' ? "Cảm ơn bạn đã thanh toán cho đơn hàng " : "Mã đơn hàng của bạn là "}
                        <span className="font-bold text-blue-600">#{orderInfo?._id?.substring(orderInfo._id.length - 6).toUpperCase()}</span>. Đơn hàng sẽ được xử lý và giao trong 2-3 ngày tới.
                      </p>
                    </>
                  )}

                  {orderInfo?.paymentMethod === 'BANK_TRANSFER' && !isPaymentReceived && (
                    <div className="mb-8 w-full max-w-md bg-blue-50/50 border border-blue-100 rounded-2xl p-6 text-left">
                      <h3 className="font-bold text-gray-900 mb-4 text-center">Hướng dẫn thanh toán chuyển khoản</h3>
                      <div className="flex flex-col items-center mb-6 bg-white p-4 rounded-xl border border-blue-100">
                        <img 
                          src={`https://vietqr.app/img?acc=106880030456&bank=VietinBank&amount=${orderInfo.totalAmount}&des=SEVQR+TKPHDT+${orderInfo._id.substring(orderInfo._id.length - 6).toUpperCase()}`} 
                          alt="QR Code" 
                          className="w-48 h-48 object-contain mb-4" 
                        />
                        <p className="text-sm text-gray-500 text-center">Quét mã QR bằng ứng dụng ngân hàng để thanh toán nhanh</p>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Ngân hàng:</span>
                          <span className="font-bold text-gray-900">VietinBank</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Chủ tài khoản:</span>
                          <span className="font-bold text-gray-900">HUYNH DUC THINH</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Số tài khoản:</span>
                          <span className="font-bold text-gray-900">106880030456</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Số tiền:</span>
                          <span className="font-bold text-red-600">{fmt(orderInfo.totalAmount)}</span>
                        </div>
                        <div className="flex flex-col gap-1 pt-1">
                          <span className="text-gray-500">Nội dung chuyển khoản:</span>
                          <div className="bg-white px-3 py-2 border border-gray-200 rounded text-center font-bold text-blue-600 text-base uppercase">
                            SEVQR TKPHDT {orderInfo._id.substring(orderInfo._id.length - 6)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Btn variant="outline" onClick={() => navigate("/profile", { state: { activeTab: "orders", openOrderId: orderInfo?._id } })}>Xem đơn hàng</Btn>
                    <Btn variant="primary" onClick={() => navigate("/")}>Tiếp tục mua sắm</Btn>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            {step !== 3 && (
              <div className="w-full lg:w-[380px]">
                <Card className="p-6 sticky top-24">
                  <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
                  <div className="flex flex-col gap-4 mb-6">
                    {isCartLoading ? (
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-3" />
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : cartItems.map((item, idx) => {
                      const product = item.productId || {};
                      const image = product.thumbnail || (product.images?.[0]) || "1610945415295-d9bbf067e59c";
                      return (
                      <div key={idx} className="flex gap-4">
                        <img src={image.startsWith("http") || image.startsWith("data:") ? image : img(image, 100, 100)} alt={product.name || "Sản phẩm"} className="w-16 h-16 rounded-lg bg-gray-50 object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{product.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">SL: {item.quantity}</span>
                            <span className="font-bold text-sm text-blue-600">{fmt((product.price || 0) * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>

                  <div className="flex gap-2 mb-6">
                    <Input 
                      placeholder="Nhập TECH10 để giảm 10%" 
                      className="flex-1" 
                      value={couponCode} 
                      onChange={setCouponCode} 
                    />
                    <Btn variant="outline" className="shrink-0" onClick={handleApplyCoupon}>Áp dụng</Btn>
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tạm tính</span>
                      <span className="font-semibold">{fmt(subtotal)}</span>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Giảm giá (10%)</span>
                        <span className="font-semibold">-{fmt(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-100 pt-3 mt-1">
                      <span className="font-bold text-gray-900 text-base">Tổng cộng</span>
                      <span className="font-black text-xl text-red-600">{fmt(total)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

        </div>
      </div>
    </UserLayout>
  );
}
