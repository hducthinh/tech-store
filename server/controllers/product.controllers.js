import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Brand from "../models/brand.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import slugify from "../utils/slugify.js";
import { v2 as cloudinary } from "cloudinary";

// Helper bóc tách public_id từ URL Cloudinary
// VD: https://res.cloudinary.com/demo/image/upload/v1234567/tech-store/products/abc.png -> tech-store/products/abc
const getCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) return null;
  const parts = imageUrl.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  const hasVersion = parts[uploadIndex + 1].startsWith("v");
  const publicIdParts = parts.slice(uploadIndex + (hasVersion ? 2 : 1));
  const fullPath = publicIdParts.join("/");
  return fullPath.split(".")[0];
};

// @desc    Lấy danh sách sản phẩm (hỗ trợ lọc, sắp xếp)
// @route   GET /api/v1/products
// @access  Public
export const getProducts = catchAsync(async (req, res, next) => {
  const { category, categoryId, brandId, minPrice, maxPrice, sortBy, search, page = 1, limit = 12 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  // Xây dựng bộ lọc thủ công (Ponytail: Đơn giản, không dùng thư viện query builder cồng kềnh)
  const filter = { isActive: true };

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      filter.categoryId = categoryDoc._id;
    } else {
      return res.status(200).json({
        status: "success",
        results: 0,
        data: { products: [] },
        pagination: { totalPages: 1, page: pageNum, total: 0 }
      });
    }
  } else if (categoryId) {
    filter.categoryId = categoryId;
  }
  
  if (req.query.categoryNames) {
    const names = req.query.categoryNames.split(",").map(n => n.trim());
    filter.categoryName = { $in: names };
  }
  if (brandId) filter.brandId = brandId;
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { categoryName: { $regex: search, $options: "i" } }
    ];
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

  const total = await Product.countDocuments(filter);
  let products;

  if (!categoryId && !search && !sortBy) {
    // Ưu tiên hiển thị VGA, CPU, Mainboard, RAM, SSD ở trang chủ
    products = await Product.aggregate([
      { $match: filter },
      {
        $addFields: {
          isCore: {
            $cond: [
              { $in: ["$categoryName", ["VGA", "CPU", "Mainboard", "RAM", "Ổ cứng SSD"]] },
              1,
              0
            ]
          },
          // Lấy ký tự cuối cùng của _id để tạo một bucket pseudo-random (0-f)
          // Giúp interleave (trộn lẫn) các category với nhau một cách ổn định
          hashBucket: { $substr: [{ $toString: "$_id" }, 23, 1] }
        }
      },
      { $sort: { isCore: -1, hashBucket: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      { $project: { costPrice: 0 } }
    ]);
    await Product.populate(products, { path: "categoryId", select: "name slug" });
  } else {
    products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-costPrice")
      .populate("categoryId", "name slug");
  }

  res.status(200).json({
    status: "success",
    results: products.length,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
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

  let query = { slug, isActive: true };
  
  // Hỗ trợ tìm bằng _id (khi không có slug)
  if (/^[0-9a-fA-F]{24}$/.test(slug)) {
    query = { $or: [{ slug }, { _id: slug }], isActive: true };
  }

  const product = await Product.findOne(query)
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

// @desc    Lấy toàn bộ sản phẩm cho Admin (Bao gồm cả sản phẩm đã xóa mềm)
// @route   GET /api/v1/products/admin
// @access  Private/Admin
export const getAdminProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .populate("categoryId", "name")
    .populate("brandId", "name");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

// @desc    Tạo sản phẩm mới (Admin)
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = catchAsync(async (req, res, next) => {
  const { name, categoryId, brandId, price, stock, description } = req.body;

  // Xử lý ảnh upload
  let thumbnail = req.body.thumbnail || "";
  let images = [];

  if (req.files) {
    if (req.files.thumbnail && req.files.thumbnail.length > 0) {
      thumbnail = req.files.thumbnail[0].path;
    }
    if (req.files.images && req.files.images.length > 0) {
      images = req.files.images.map((f) => f.path);
    }
  }

  // Validate basic
  if (!name || !categoryId || !brandId || price === undefined || stock === undefined) {
    return next(new AppError("Vui lòng điền đủ thông tin cơ bản của sản phẩm.", 400));
  }

  // Lấy tên Category & Brand
  const category = await Category.findById(categoryId);
  if (!category) return next(new AppError("Danh mục không tồn tại.", 404));

  const brand = await Brand.findById(brandId);
  if (!brand) return next(new AppError("Thương hiệu không tồn tại.", 404));

  const slug = slugify(name);

  let parsedSpecs = {};
  if (req.body.specs) {
    try {
      parsedSpecs = JSON.parse(req.body.specs);
    } catch (e) {
      console.error("Lỗi parse specs:", e);
    }
  }

  const newProduct = await Product.create({
    name,
    slug,
    categoryId,
    categoryName: category.name,
    brandId,
    brandName: brand.name,
    price,
    stock,
    description,
    specs: parsedSpecs,
    thumbnail: thumbnail || "",
    images: images,
  });

  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
});

// @desc    Cập nhật sản phẩm (Admin)
// @route   PATCH /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // 1. Tìm sản phẩm cũ để lấy URL ảnh cũ
  const oldProduct = await Product.findById(id);
  if (!oldProduct) {
    return next(new AppError("Không tìm thấy sản phẩm", 404));
  }

  // Nếu cập nhật category/brand, ta phải cập nhật cả name của chúng
  const updateData = { ...req.body };
  const imagesToDelete = [];
  
  if (req.files) {
    if (req.files.thumbnail && req.files.thumbnail.length > 0) {
      updateData.thumbnail = req.files.thumbnail[0].path;
      // Nếu có ảnh mới và ảnh cũ khác nhau, đánh dấu ảnh cũ để xóa
      if (oldProduct.thumbnail && oldProduct.thumbnail !== updateData.thumbnail) {
        imagesToDelete.push(oldProduct.thumbnail);
      }
    }
  }

  if (req.body.clearThumbnail === "true") {
    updateData.thumbnail = "";
    if (oldProduct.thumbnail) {
      imagesToDelete.push(oldProduct.thumbnail);
    }
  }

  // Handle mixing existing images and new images
  if (req.body.existingImages !== undefined || (req.files && req.files.images && req.files.images.length > 0)) {
    let existing = [];
    if (req.body.existingImages) {
      existing = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
    }
    const newImgs = req.files && req.files.images ? req.files.images.map((f) => f.path) : [];
    updateData.images = [...existing, ...newImgs].filter(Boolean);

    // Xác định những ảnh phụ nào của product cũ đã bị xóa khỏi existing
    if (oldProduct.images && oldProduct.images.length > 0) {
      oldProduct.images.forEach(oldImg => {
        if (!existing.includes(oldImg)) {
          imagesToDelete.push(oldImg);
        }
      });
    }
  }

  // 2. Thực hiện xóa rác trên Cloudinary (Bắt lỗi nhưng không block quá trình cập nhật db)
  if (imagesToDelete.length > 0) {
    imagesToDelete.forEach(imgUrl => {
      const publicId = getCloudinaryPublicId(imgUrl);
      if (publicId) {
        cloudinary.uploader.destroy(publicId)
          .catch(err => console.error("Lỗi xóa ảnh Cloudinary:", err));
      }
    });
  }

  if (updateData.name) {
    updateData.slug = slugify(updateData.name);
  }

  if (updateData.categoryId) {
    const category = await Category.findById(updateData.categoryId);
    if (category) updateData.categoryName = category.name;
  }

  if (updateData.brandId) {
    const brand = await Brand.findById(updateData.brandId);
    if (brand) updateData.brandName = brand.name;
  }

  if (updateData.specs) {
    try {
      updateData.specs = JSON.parse(updateData.specs);
    } catch (e) {
      console.error("Lỗi parse specs update:", e);
      delete updateData.specs;
    }
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("Không tìm thấy sản phẩm", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// @desc    Xóa mềm / Khôi phục sản phẩm (Toggle isActive) (Admin)
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError("Không tìm thấy sản phẩm", 404));
  }

  // Toggle trạng thái
  product.isActive = !product.isActive;
  await product.save();

  res.status(200).json({
    status: "success",
    message: product.isActive ? "Đã khôi phục sản phẩm" : "Đã vô hiệu hóa sản phẩm",
    data: {
      product,
    },
  });
});

// @desc    Lấy sản phẩm tương tự
// @route   GET /api/v1/products/:slug/similar
// @access  Public
export const getSimilarProducts = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const currentProduct = await Product.findOne({ slug, isActive: true });
  if (!currentProduct) {
    return next(new AppError("Không tìm thấy sản phẩm", 404));
  }

  // Lấy 4 sản phẩm cùng danh mục, khác ID sản phẩm hiện tại
  const products = await Product.find({
    categoryId: currentProduct.categoryId,
    _id: { $ne: currentProduct._id },
    isActive: true
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("-costPrice")
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});
