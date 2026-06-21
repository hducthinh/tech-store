import Brand from "../models/brand.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import slugify from "../utils/slugify.js";

// @desc    Lấy tất cả thương hiệu
// @route   GET /api/v1/brands
// @access  Public
export const getBrands = catchAsync(async (req, res) => {
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
export const getBrandBySlug = catchAsync(async (req, res, next) => {
  const brand = await Brand.findOne({
    slug: req.params.slug,
    isActive: true,
  }).lean();

  if (!brand) {
    return next(new AppError("Không tìm thấy thương hiệu", 404));
  }

  res.status(200).json({
    status: "success",
    data: { brand },
  });
});

// @desc    Tạo thương hiệu mới
// @route   POST /api/v1/brands
// @access  Private (Admin)
export const createBrand = catchAsync(async (req, res) => {
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
export const updateBrand = catchAsync(async (req, res, next) => {
  const updates = { ...req.body };

  if (updates.name) {
    updates.slug = slugify(updates.name);
  }

  const brand = await Brand.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!brand) {
    return next(new AppError("Không tìm thấy thương hiệu", 404));
  }

  res.status(200).json({
    status: "success",
    data: { brand },
  });
});

// @desc    Xóa mềm thương hiệu
// @route   DELETE /api/v1/brands/:id
// @access  Private (Admin)
export const deleteBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!brand) {
    return next(new AppError("Không tìm thấy thương hiệu", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Đã xóa thương hiệu",
  });
});
