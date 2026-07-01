import React, { useState, useEffect, useMemo } from "react";
import { X, Search, ChevronRight, AlertTriangle } from "lucide-react";
import { checkItemCompatibility } from "../../features/builder/utils/compatibility";
import api from "../../services/api";
import { fmt, img } from "../SharedUI";

export default function ProductSelectionModal({ isOpen, onClose, categoryKey, categoryId, currentConfig, onSelect }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [ramFilter, setRamFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (!isOpen) {
      // Clear old data when closed so it doesn't flash on next open
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProducts([]);
      setSearch("");
      setPriceFilter("");
      setBrandFilter("");
      setRamFilter("");
      return;
    }
    
    // Set loading immediately to show skeleton while waiting for debounce
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const res = await api.get("/products", {
          params: { categoryNames: categoryKey, limit: 100, search: search.trim() || undefined }
        });
        setProducts(res.data?.data?.products || []);
      } catch (error) {
        console.error("Failed to fetch products for modal", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchProducts, 300); // debounce
    return () => clearTimeout(timeout);
  }, [isOpen, categoryKey, search]);

  const availableBrands = useMemo(() => {
    const brands = new Set();
    products.forEach(p => {
      if (p.brand?.name) brands.add(p.brand.name);
      else if (p.brandName) brands.add(p.brandName);
    });
    return Array.from(brands).sort();
  }, [products]);

  const availableRamTypes = useMemo(() => {
    if (categoryId !== 'ram') return [];
    const types = new Set();
    products.forEach(p => {
      const name = p.name.toUpperCase();
      const specRam = (p.specs?.['Loại RAM'] || p.specs?.['Loại bộ nhớ'] || '').toUpperCase();
      const fullText = `${name} ${specRam}`;
      if (fullText.includes('DDR4') || fullText.includes('D4')) types.add('DDR4');
      if (fullText.includes('DDR5') || fullText.includes('D5')) types.add('DDR5');
    });
    return Array.from(types).sort();
  }, [products, categoryId]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (priceFilter) {
      result = result.filter(p => {
        if (priceFilter === '<1') return p.price < 1000000;
        if (priceFilter === '1-2') return p.price >= 1000000 && p.price <= 2000000;
        if (priceFilter === '2-5') return p.price >= 2000000 && p.price <= 5000000;
        if (priceFilter === '5-10') return p.price >= 5000000 && p.price <= 10000000;
        if (priceFilter === '>10') return p.price > 10000000;
        return true;
      });
    }

    if (brandFilter) {
      result = result.filter(p => (p.brand?.name || p.brandName) === brandFilter);
    }

    if (ramFilter) {
      result = result.filter(p => {
        const name = p.name.toUpperCase();
        const specRam = (p.specs?.['Loại RAM'] || p.specs?.['Loại bộ nhớ'] || '').toUpperCase();
        const fullText = `${name} ${specRam}`;
        if (ramFilter === 'DDR4') return fullText.includes('DDR4') || fullText.includes('D4');
        if (ramFilter === 'DDR5') return fullText.includes('DDR5') || fullText.includes('D5');
        return true;
      });
    }

    if (sortOrder === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } // newest is default from backend usually

    return result;
  }, [products, priceFilter, brandFilter, ramFilter, sortOrder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Red matching Hotgear */}
        <div className="bg-[#e30019] text-white p-3 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold uppercase tracking-wide w-1/4 pl-2">Chọn linh kiện</h2>
          
          <div className="flex-1 max-w-2xl mx-4 relative">
            <input 
              type="text" 
              placeholder="Bạn cần tìm linh kiện gì?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-12 py-2 bg-white text-gray-900 border-none focus:ring-0 focus:outline-none placeholder-gray-500 rounded"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#e30019] font-bold">
              <Search size={20} strokeWidth={3} />
            </button>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-white/20 transition-colors mr-2">
            <X size={28} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 flex overflow-hidden bg-white">
          {/* Sidebar Filters */}
          <div className="w-64 shrink-0 border-r border-gray-200 p-6 overflow-y-auto hidden md:block bg-white">
            
            <div className="mb-8">
              <h4 className="font-bold text-[#1a2b49] text-[15px] uppercase mb-3">Sắp xếp</h4>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-gray-400 font-medium text-gray-800"
              >
                <option value="newest">Hàng mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
              <div className="border-b border-gray-100 mt-6"></div>
            </div>

            {availableBrands.length > 0 && (
              <div className="mb-8">
                <h4 className="font-bold text-[#1a2b49] text-[15px] uppercase mb-4">Hãng sản xuất</h4>
                <div className="flex flex-col gap-3">
                  {availableBrands.map((brand: any) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer text-base text-[#4a5568] hover:text-[#1a2b49] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={brandFilter === brand} 
                        onChange={() => setBrandFilter(brandFilter === brand ? "" : brand)} 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      {brand}
                    </label>
                  ))}
                </div>
                <div className="border-b border-gray-100 mt-6"></div>
              </div>
            )}

            {availableRamTypes.length > 0 && (
              <div className="mb-8">
                <h4 className="font-bold text-[#1a2b49] text-[15px] uppercase mb-4">Loại RAM</h4>
                <div className="flex flex-col gap-3">
                  {availableRamTypes.map((type: any) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer text-base text-[#4a5568] hover:text-[#1a2b49] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={ramFilter === type} 
                        onChange={() => setRamFilter(ramFilter === type ? "" : type)} 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      {type}
                    </label>
                  ))}
                </div>
                <div className="border-b border-gray-100 mt-6"></div>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="font-bold text-[#1a2b49] text-[15px] uppercase mb-4">Giá</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer text-base text-[#4a5568] hover:text-[#1a2b49] transition-colors">
                  <input type="checkbox" checked={priceFilter === '<1'} onChange={() => setPriceFilter(priceFilter === '<1' ? "" : '<1')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0" />
                  Dưới 1,000,000đ
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-base text-[#4a5568] hover:text-[#1a2b49] transition-colors">
                  <input type="checkbox" checked={priceFilter === '1-2'} onChange={() => setPriceFilter(priceFilter === '1-2' ? "" : '1-2')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0" />
                  1,000,000đ - 2,000,000đ
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-base text-[#4a5568] hover:text-[#1a2b49] transition-colors">
                  <input type="checkbox" checked={priceFilter === '2-5'} onChange={() => setPriceFilter(priceFilter === '2-5' ? "" : '2-5')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0" />
                  2,000,000đ - 5,000,000đ
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-base text-[#4a5568] hover:text-[#1a2b49] transition-colors">
                  <input type="checkbox" checked={priceFilter === '5-10'} onChange={() => setPriceFilter(priceFilter === '5-10' ? "" : '5-10')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0" />
                  5,000,000đ - 10,000,000đ
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-base text-[#4a5568] hover:text-[#1a2b49] transition-colors">
                  <input type="checkbox" checked={priceFilter === '>10'} onChange={() => setPriceFilter(priceFilter === '>10' ? "" : '>10')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0" />
                  Trên 10,000,000đ
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Top bar (Results Count) */}
            <div className="flex items-center justify-end p-3 border-b border-gray-200 bg-white shrink-0">
              <div className="text-sm text-gray-500 font-medium">
                Tìm thấy {filteredProducts.length} sản phẩm
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-0">
              {loading ? (
                <div className="flex flex-col">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-center gap-6 p-4 border-b border-gray-100 animate-pulse">
                      <div className="w-32 h-32 shrink-0 bg-gray-200 rounded"></div>
                      <div className="flex-1 flex flex-col justify-center w-full">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="flex flex-col gap-2">
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-32 mt-4"></div>
                      </div>
                      <div className="shrink-0 flex items-center justify-end w-full sm:w-48 mt-4 sm:mt-0">
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="flex flex-col">
                  {filteredProducts.map(p => {
                    const image = p.thumbnail || p.images?.[0] || "1610945415295-d9bbf067e59c";
                    return (
                      <div 
                        key={p._id} 
                        className="flex flex-col sm:flex-row items-center gap-6 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-32 h-32 shrink-0 p-2 flex items-center justify-center bg-white border border-gray-100">
                          <img src={image.startsWith("http") || image.startsWith("data:") ? image : img(image, 200, 200)} alt={p.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="font-bold text-[#004e9a] text-base hover:text-red-600 transition-colors cursor-pointer line-clamp-2 leading-snug">{p.name}</h3>
                          
                          <div className="mt-3 flex flex-col gap-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-20">Mã SP:</span> 
                              <span>{p.sku || p._id.slice(-6).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-20">Bảo hành:</span> 
                              <span>36 tháng</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-20">Kho hàng:</span> 
                              <span className="text-green-600 font-medium">Còn hàng</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <span className="font-black text-red-600 text-xl">{fmt(p.price)}</span>
                            {p.originalPrice > p.price && (
                              <span className="text-sm text-gray-400 line-through ml-3">{fmt(p.originalPrice)}</span>
                            )}
                          </div>
                          
                          {(() => {
                            const incompatibleMsg = checkItemCompatibility(p, categoryId, currentConfig);
                            if (incompatibleMsg) {
                              return (
                                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                  <AlertTriangle size={14} className="shrink-0" />
                                  <span>{incompatibleMsg}</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        <div className="shrink-0 flex items-center justify-end sm:w-48">
                          <button 
                            onClick={() => {
                              onSelect(p);
                              onClose();
                            }}
                            className="w-full py-2.5 px-4 bg-[#0074da] hover:bg-[#005ea6] text-white font-bold text-sm uppercase flex items-center justify-center gap-1 transition-colors"
                          >
                            Thêm vào cấu hình <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center flex flex-col items-center justify-center h-60 text-gray-500">
                  <p className="font-medium text-gray-800 text-lg">Hiện tại cửa hàng chưa có loại sản phẩm phù hợp với nhu cầu của bạn.</p>
                  <p className="text-base mt-2 text-gray-600">Xin lỗi vì sự bất tiện này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
