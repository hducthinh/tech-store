import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Lấy danh sách sản phẩm (hỗ trợ lọc, sắp xếp)
// @route   GET /api/v1/products
// @access  Public
export const getProducts = catchAsync(async (req, res, next) => {
  const { categoryId, brandId, minPrice, maxPrice, sortBy, search } = req.query;

  // Xây dựng bộ lọc thủ công (Ponytail: Đơn giản, không dùng thư viện query builder cồng kềnh)
  const filter = { isActive: true };

  if (categoryId) filter.categoryId = categoryId;
  if (brandId) filter.brandId = brandId;
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Nếu có từ khóa tìm kiếm, dùng text index (chuẩn bị sẵn cho Day 7)
  if (search) {
    filter.$text = { $search: search };
  }

  // Xây dựng tiêu chí sắp xếp
  let sort = { createdAt: -1 }; // Mặc định sản phẩm mới nhất
  if (sortBy) {
    switch (sortBy) {
      case "price_asc":
        sort = { price: 1 };
        break;
      case "price_desc":
        sort = { price: -1 };
        break;
      case "soldCount_desc":
        sort = { soldCount: -1 };
        break;
      case "rating_desc":
        sort = { rating: -1 };
        break;
      default:
        break;
    }
  }

  const products = await Product.find(filter)
    .sort(sort)
    .select("-costPrice"); // Bảo mật: Không bao giờ trả về giá nhập gốc cho frontend

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

// @desc    Lấy danh sách sản phẩm nổi bật
// @route   GET /api/v1/products/featured
// @access  Public
export const getFeaturedProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(10) // Lấy tối đa 10 sản phẩm nổi bật nhất
    .select("-costPrice");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

// @desc    Lấy chi tiết sản phẩm theo slug
// @route   GET /api/v1/products/:slug
// @access  Public
export const getProductBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isActive: true })
    .select("-costPrice")
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug");

  if (!product) {
    return next(new AppError("Không tìm thấy sản phẩm", 404));
  }

  // Fire and forget: Tăng lượt xem mà không cần đợi lưu xong
  Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).exec();

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});
