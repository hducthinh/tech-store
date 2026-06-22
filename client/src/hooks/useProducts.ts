import { useState, useEffect } from "react";
import api from "../services/api";
import { Product } from "../../types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categoriesDb, setCategoriesDb] = useState<{_id: string, name: string}[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Tải danh mục
    api.get("/categories")
      .then(res => {
        if (res.data.status === "success") {
          setCategoriesDb(res.data.data.categories);
        }
      })
      .catch(err => console.error("Lỗi tải danh mục:", err));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;

        const res = await api.get("/products", { params });
        if (res.data.status === "success") {
          const fetchedProducts = res.data.data.products.map((p: any) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            originalPrice: p.price * 1.2,
            rating: 4.5,
            reviews: p.soldCount || Math.floor(Math.random() * 500),
            image: p.thumbnail || (p.images && p.images.length > 0 ? p.images[0] : "https://via.placeholder.com/300"),
            description: p.description,
            specs: [
              "Hàng chính hãng",
              p.stock > 0 ? `Còn ${p.stock} sản phẩm` : "Hết hàng"
            ],
            category: p.categoryId ? p.categoryId.name : "Uncategorized"
          }));
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  return {
    products,
    loadingProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categoriesDb,
    selectedProduct,
    setSelectedProduct
  };
}
