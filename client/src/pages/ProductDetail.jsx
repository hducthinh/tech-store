import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Truck, ShieldCheck, Zap, MessageSquare } from "lucide-react";
import { fmt, img, Btn, Badge } from "../components/SharedUI";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useCart } from "../contexts/CartContext";
import { useAlert } from "../contexts/AlertContext";
import ProductReviews from "../components/products/ProductReviews";
import api from "../services/api";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const [reviews, setReviews] = useState([]);
  
  const { addToCart } = useCart();
  const { showAlert, showToast } = useAlert();

  const fetchReviews = async (productId) => {
    try {
      const res = await api.get(`/reviews/${productId}`);
      setReviews(res.data?.data?.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${slug}`);
        const p = response.data?.data?.product;
        setProduct(p);
        if (p?._id) fetchReviews(p._id);
      } catch (error) {
        console.error("Failed to fetch product detail", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const images = product ? (product.images || []).filter(Boolean) : [];
  if (images.length === 0 && product) {
    images.push(product.thumbnail || product.img || "1610945415295-d9bbf067e59c");
  }

  useDocumentMeta(
    product ? `${product.name} - TechCart` : "Đang tải... - TechCart",
    "Chi tiết sản phẩm"
  );

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!product) return <div className="p-10 text-center">Không tìm thấy sản phẩm</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-semibold">
          <button onClick={() => navigate(-1)} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Quay lại
          </button>
          <span>/</span>
          <span 
            className="hover:text-blue-600 cursor-pointer"
            onClick={() => {
              if (product.categoryId?.slug) navigate(`/collections/${product.categoryId.slug}`);
            }}
          >
            {product.categoryId?.name || product.categoryName || product.category || "Danh mục"}
          </span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Main Product Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="grid md:grid-cols-2 gap-10">
                {/* Gallery */}
                <div className="flex flex-col gap-4">
                  <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-8 border border-gray-100">
                    <img src={images[activeImage] && (images[activeImage].startsWith("http") || images[activeImage].startsWith("data:")) ? images[activeImage] : img(images[activeImage], 800, 800)} alt="Product" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {images.slice(0, 4).map((imgSrc, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 p-2 bg-gray-50 ${activeImage === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-300'} transition-all`}
                      >
                        <img src={imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("data:")) ? imgSrc : img(imgSrc, 200, 200)} alt="Thumb" className="w-full h-full object-contain mix-blend-multiply" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge color="blue">{product.brandName || product.brand}</Badge>
                      {product.sku && <span className="text-xs text-gray-500">SKU: {product.sku}</span>}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>
                    <div className="flex items-center gap-2 mb-4">
                      <Star size={16} className="fill-amber-500 text-amber-500" />
                      <span className="text-sm font-bold text-gray-700">{product.rating || 5}</span>
                      <span className="text-sm text-gray-300">|</span>
                      <span className="text-sm text-gray-500">{product.soldCount || 0} đã bán</span>
                    </div>
                  </div>

                  <div className="mb-8 border-b border-gray-100 pb-6">
                    <div className="flex items-end gap-3 mb-2">
                      <span className="text-3xl font-black text-blue-600">{fmt(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-base font-bold text-gray-400 line-through mb-1">{fmt(product.originalPrice)}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-4 leading-relaxed">{product.shortDescription || product.name}</p>
                  </div>

                  {/* Quantity & Add to Cart */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                    <div className="flex items-center border border-gray-200 rounded-xl h-12 p-1 w-32 shrink-0">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center font-bold text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">-</button>
                      <input 
                        type="text" 
                        value={quantity} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setQuantity("");
                            return;
                          }
                          const num = parseInt(val.replace(/\D/g, ''));
                          if (!isNaN(num)) setQuantity(Math.min(product.stock || 100, num));
                        }}
                        onBlur={() => {
                          if (quantity === "" || quantity < 1) setQuantity(1);
                        }}
                        className="w-12 h-full font-bold text-gray-900 text-sm text-center border-none focus:ring-0 focus:outline-none p-0 bg-transparent"
                      />
                      <button type="button" onClick={() => setQuantity(Math.min(product.stock || 100, (Number(quantity) || 0) + 1))} className="w-10 h-full flex items-center justify-center font-bold text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">+</button>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs text-gray-500 font-medium">Còn hàng</span>
                      <span className="text-sm font-bold text-red-600">{product.stock || 0} sản phẩm</span>
                    </div>
                  </div>
                  
                  <Btn variant="primary" size="lg" className="w-full justify-center h-12 text-base rounded-xl shadow-lg shadow-blue-600/30" onClick={() => {
                    addToCart(product._id, quantity);
                    showToast(`Đã thêm ${quantity} sản phẩm ${product.name} vào giỏ hàng`, "success");
                  }}>
                    <ShoppingCart size={20} /> Thêm vào giỏ
                  </Btn>
                </div>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6">Thông tin chi tiết</h2>
              <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: product.description || "<p>Chưa có mô tả chi tiết cho sản phẩm này.</p>" }} />
            </div>

            {/* Đánh giá & Bình luận */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-gray-500" /> Đánh giá & Bình luận
              </h2>
              <ProductReviews product={product} reviews={reviews} fetchReviews={() => fetchReviews(product._id)} />
            </div>
            
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6">Thông số kỹ thuật</h2>
              <div className="overflow-y-auto max-h-[400px] custom-scrollbar rounded-2xl border border-gray-200">
                <table className="w-full text-left text-gray-600 text-sm">
                  <tbody>
                    {product.specs && Object.entries(product.specs).length > 0 ? (
                      Object.entries(product.specs).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="py-3 px-4 font-semibold border-b border-gray-100 w-2/5 leading-snug">{key}</td>
                          <td className="py-3 px-4 border-b border-gray-100 leading-snug">{value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-8 text-center text-gray-500">Đang cập nhật thông số kỹ thuật.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
