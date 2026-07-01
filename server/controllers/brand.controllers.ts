import Brand from "../models/brand.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import slugify from "../utils/slugify.js";

// @desc    Lấy tất cả thương hiệu cho Admin (Bao gồm thương hiệu ẩn)
// @route   GET /api/v1/brands/admin
// @access  Private (Admin)
export const getAdminBrands = asyncHandler(async (req: any, res: any) => {
  const brands = await Brand.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "brandId",
        as: "brandProducts"
      }
    },
    {
      $addFields: {
        products: { $size: "$brandProducts" },
        id: "$_id" // Để đồng nhất với .lean() hoặc Schema ảo nếu cần
      }
    },
    {
      $project: {
        brandProducts: 0
      }
    },
    {
      $sort: { displayOrder: 1, name: 1 }
    }
  ]);

  res.status(200).json({
    status: "success",
    results: brands.length,
    data: { brands },
  });
});

// @desc    Lấy tất cả thương hiệu đang active
// @route   GET /api/v1/brands
// @access  Public
export const getBrands = asyncHandler(async (req: any, res: any) => {
  const brands = await Brand.find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.status(200).json({
    status: "success",
    results: brands.length,
    data: { brands },
  });
});

// @desc    Lấy chi tiết thương hiệu theo slug
// @route   GET /api/v1/brands/:slug
// @access  Public
export const getBrandBySlug = asyncHandler(async (req: any, res: any, next: any) => {
  const brand = await Brand.findOne({
    slug: req.params.slug,
    isActive: true,
  }).lean();

  if (!brand) {
    return next(new ApiError("Không tìm thấy thương hiệu", 404));
  }

  res.status(200).json({
    status: "success",
    data: { brand },
  });
});

// @desc    Tạo thương hiệu mới
// @route   POST /api/v1/brands
// @access  Private (Admin)
export const createBrand = asyncHandler(async (req: any, res: any) => {
  const { name, description, logo, displayOrder } = req.body;

  const brand = await Brand.create({
    name,
    slug: slugify(name),
    description,
    logo,
    displayOrder,
  });

  res.status(201).json({
    status: "success",
    data: { brand },
  });
});

// @desc    Cập nhật thương hiệu
// @route   PATCH /api/v1/brands/:id
// @access  Private (Admin)
export const updateBrand = asyncHandler(async (req: any, res: any, next: any) => {
  const updates = { ...req.body };

  if (updates.name) {
    updates.slug = slugify(updates.name);
  }

  const brand = await Brand.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!brand) {
    return next(new ApiError("Không tìm thấy thương hiệu", 404));
  }

  res.status(200).json({
    status: "success",
    data: { brand },
  });
});

// @desc    Xóa mềm thương hiệu (Toggle isActive)
// @route   DELETE /api/v1/brands/:id
// @access  Private (Admin)
export const deleteBrand = asyncHandler(async (req: any, res: any, next: any) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ApiError("Không tìm thấy thương hiệu", 404));
  }

  brand.isActive = !brand.isActive;
  await brand.save();

  res.status(200).json({
    status: "success",
    message: brand.isActive ? "Đã khôi phục thương hiệu" : "Đã vô hiệu hóa thương hiệu",
    data: { brand }
  });
});

