import React, { useState, useMemo, useEffect } from "react";
import { Search, RotateCcw, Image as ShoppingCart, Trash2, Edit2, CreditCard, AlertTriangle } from "lucide-react";
import { fmt, img, Btn } from "../../components/SharedUI";
import ProductSelectionModal from "../../components/common/ProductSelectionModal";
import { useCart } from "../../contexts/CartContext";
import { useAlert } from "../../contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import { checkCompatibility } from "./utils/compatibility";

const PC_CATEGORIES = [
  { id: 'cpu', label: '1. CPU - Bộ vi xử lý', queryKeys: 'CPU,Bộ vi xử lý,Vi xử lý' },
  { id: 'mainboard', label: '2. MAINBOARD - Bo mạch chủ', queryKeys: 'MAINBOARD,Bo mạch chủ' },
  { id: 'ram', label: '3. RAM - Bộ nhớ trong', queryKeys: 'RAM,Bộ nhớ trong' },
  { id: 'vga', label: '4. VGA - Card màn hình', queryKeys: 'VGA,Card màn hình' },
  { id: 'ssd', label: '5. Ổ CỨNG', queryKeys: 'SSD,Ổ cứng' },
  { id: 'psu', label: '6. PSU - Nguồn máy tính', queryKeys: 'PSU,Nguồn máy tính,Nguồn' },
  { id: 'case', label: '7. CASE - VỎ MÁY TÍNH', queryKeys: 'CASE,Vỏ máy tính' },
  { id: 'cooler', label: '8. TẢN NHIỆT', queryKeys: 'FAN' },
  { id: 'monitor', label: '9. MONITOR - Màn Hình', queryKeys: 'MONITOR,màn hình,Màn hình' },
  { id: 'keyboard', label: '10. KEYBOARD - Bàn phím', queryKeys: 'Bàn phím,KEYBOARD' },
  { id: 'mouse', label: '11. MOUSE - Chuột máy tính', queryKeys: 'Chuột,Chuột máy tính,MOUSE' },
  { id: 'mousepad', label: '12. MOUSE PAD - Lót chuột', queryKeys: 'Lót chuột,MOUSEPAD' },
  { id: 'headphone', label: '13. TAI NGHE', queryKeys: 'Tai nghe,Headphone' },
  { id: 'monitor_arm', label: '14. GIÁ TREO MÀN HÌNH', queryKeys: 'Giá treo màn hình,Giá treo,ARM' },
  { id: 'speaker', label: '15. Loa', queryKeys: 'Loa,SPEAKER' },
  { id: 'chair', label: '16. Ghế', queryKeys: 'Ghế,Ghế gaming,CHAIR' },
];

export default function PCBuilder() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("pc_builder_config");
      return saved ? JSON.parse(saved) : {};
    } catch (_e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("pc_builder_config", JSON.stringify(config));
  }, [config]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const { addToCart } = useCart();
  const { showToast } = useAlert();
  const navigate = useNavigate();

  const handleOpenModal = (category) => {
    setActiveCategory(category);
    setModalOpen(true);
  };

  const handleSelectProduct = (product) => {
    if (activeCategory) {
      setConfig(prev => ({
        ...prev,
        [activeCategory.id]: { product, quantity: 1 }
      }));
    }
  };

  const handleRemoveItem = (id) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      delete newConfig[id];
      return newConfig;
    });
  };

  const handleQuantityChange = (id, newQty) => {
    if (newQty < 1) return;
    setConfig(prev => ({
      ...prev,
      [id]: { ...prev[id], quantity: newQty }
    }));
  };

  const handleReset = () => {
    setConfig({});
  };

  const totalPrice = useMemo(() => {
    return Object.values(config).reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [config]);

  const { warnings, totalTDP } = useMemo(() => {
    return checkCompatibility(config);
  }, [config]);

  const handleAddAllToCart = async () => {
    const items = Object.values(config);
    if (items.length === 0) {
      return showToast("Cấu hình của bạn đang trống!", "error");
    }

    try {
      const buildId = "PCBUILD-" + Date.now().toString();
      let allSuccess = true;
      for (const item of items) {
        const success = await addToCart(item.product._id, item.quantity, buildId);
        if (!success) {
          allSuccess = false;
          break;
        }
      }
      if (allSuccess) {
        showToast("Đã thêm toàn bộ cấu hình vào giỏ hàng!", "success");
        setConfig({});
        navigate("/"); // or open cart drawer
      }
    } catch (_error) {
      showToast("Có lỗi xảy ra khi thêm vào giỏ hàng", "error");
    }
  };

  const handleDirectCheckout = async () => {
    const items = Object.values(config);
    if (items.length === 0) {
      return showToast("Cấu hình của bạn đang trống!", "error");
    }

    try {
      const buildId = "PCBUILD-" + Date.now().toString();
      let allSuccess = true;
      for (const item of items) {
        const success = await addToCart(item.product._id, item.quantity, buildId);
        if (!success) {
          allSuccess = false;
          break;
        }
      }
      if (allSuccess) {
        showToast("Đã chuyển sang trang thanh toán!", "success");
        // Không gọi setConfig({}) ở đây để giữ lại dữ liệu nếu khách hàng bấm Back quay lại
        navigate("/checkout", { state: { selectedItemIds: [buildId] } });
      }
    } catch (_error) {
      showToast("Có lỗi xảy ra khi chuẩn bị thanh toán", "error");
    }
  };

  

  return (
    <div className="bg-[#F5F7FA] min-h-screen pt-4 pb-20">
      <div className="max-w-6xl mx-auto px-4">

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">

          {/* Action Bar Top */}
          <div className="bg-white px-4 md:px-6 py-3 border-b border-gray-100 flex flex-col xl:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1 w-full xl:w-auto overflow-hidden">
              <div className="flex items-center gap-2 md:gap-4 flex-wrap md:flex-nowrap">
                <h1 className="text-lg md:text-xl font-black text-gray-800 uppercase tracking-tight hidden md:block whitespace-nowrap">Xây Cấu Hình</h1>
                <div className="h-6 w-[2px] bg-gray-200 hidden md:block shrink-0"></div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-gray-500 font-medium text-sm md:text-base hidden sm:block whitespace-nowrap">Chi phí dự tính:</span>
                  <span className="text-xl md:text-2xl font-black text-red-600 whitespace-nowrap">{fmt(totalPrice)}</span>
                </div>
                {totalTDP > 0 && (
                  <div className="text-xs md:text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap shrink-0">
                    TDP: {totalTDP}W
                  </div>
                )}
              </div>
              {warnings.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit max-w-full">
                      <AlertTriangle size={14} className="shrink-0" /> <span className="truncate" title={w}>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
              <Btn variant="outline" onClick={handleReset} className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 px-2 md:px-3 whitespace-nowrap shrink-0 text-sm">
                <RotateCcw size={16} /> <span className="hidden sm:inline">Làm mới</span>
              </Btn>
              <Btn variant="primary" onClick={handleAddAllToCart} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-md px-2 md:px-3 whitespace-nowrap shrink-0 text-sm">
                <ShoppingCart size={16} /> Thêm vào giỏ
              </Btn>
              <Btn variant="primary" onClick={handleDirectCheckout} className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-md px-2 md:px-3 whitespace-nowrap shrink-0 text-sm">
                <CreditCard size={16} /> Thanh toán
              </Btn>
            </div>
          </div>

          {/* Categories List (Table Style) */}
          <div className="flex flex-col">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[220px_1fr_100px_130px_80px] gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider items-center">
              <div>Linh kiện</div>
              <div>Tên sản phẩm</div>
              <div className="text-center">Số lượng</div>
              <div className="text-right">Thành tiền</div>
              <div className="text-center">Thao tác</div>
            </div>

            {PC_CATEGORIES.map((cat) => {
              const selected = config[cat.id];

              return (
                <div key={cat.id} className="grid grid-cols-1 md:grid-cols-[220px_1fr_100px_130px_80px] gap-4 p-4 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors md:items-center">

                  {/* Category Name */}
                  <div className="font-bold text-gray-800 text-sm md:text-base uppercase">
                    {cat.label}
                  </div>

                  {!selected ? (
                    <>
                      <div className="text-gray-400 italic text-sm hidden md:block">
                        Vui lòng chọn linh kiện...
                      </div>
                      <div className="hidden md:block"></div>
                      <div className="hidden md:block"></div>
                      <div className="flex md:justify-center">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="py-1.5 px-3 border border-blue-500 text-blue-600 rounded flex items-center justify-center gap-1.5 text-sm hover:bg-blue-50 transition-all font-semibold whitespace-nowrap"
                        >
                          <Search size={14} /> Chọn
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Product Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded p-1 shrink-0 border border-gray-200 flex items-center justify-center">
                          <img
                            src={(selected.product.thumbnail || selected.product.images?.[0] || "").startsWith("http") ? (selected.product.thumbnail || selected.product.images?.[0]) : img(selected.product.thumbnail || selected.product.images?.[0], 200)}
                            alt={selected.product.name}
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => window.open(`/products/${selected.product.slug}`, '_blank')}>
                            {selected.product.name}
                          </h4>
                          <span className="text-gray-400 text-xs mt-0.5 block truncate">Mã SP: {selected.product.sku || selected.product._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex md:justify-center">
                        <div className="flex items-center bg-white rounded border border-gray-300 overflow-hidden h-8 w-20">
                          <button onClick={() => handleQuantityChange(cat.id, selected.quantity - 1)} className="w-7 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">-</button>
                          <input
                            type="text"
                            value={selected.quantity}
                            readOnly
                            className="w-6 h-full text-center text-xs font-bold bg-transparent border-none p-0 focus:ring-0"
                          />
                          <button onClick={() => handleQuantityChange(cat.id, selected.quantity + 1)} className="w-7 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">+</button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-left md:text-right font-bold text-red-600 text-base">
                        {fmt(selected.product.price * selected.quantity)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center md:justify-center gap-2">
                        <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Đổi sản phẩm">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleRemoveItem(cat.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>



        </div>
      </div>

      <ProductSelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoryKey={activeCategory?.queryKeys}
        categoryId={activeCategory?.id}
        categoryName={activeCategory?.label?.split(' - ')[1] || activeCategory?.label}
        currentConfig={config}
        onSelect={handleSelectProduct}
      />

    </div>
  );
}
