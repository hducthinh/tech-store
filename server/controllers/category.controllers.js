import Category from "../models/category.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import slugify from "../utils/slugify.js";

// @desc    Lấy tất cả danh mục cho Admin (Bao gồm danh mục ẩn)
// @route   GET /api/v1/categories/admin
// @access  Private (Admin)
export const getAdminCategories = catchAsync(async (req, res) => {
  const categories = await Category.find()
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: { categories },
  });
});

// @desc    Lấy tất cả danh mục đang active
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "categoryId",
        as: "productItems"
      }
    },
    {
      $addFields: {
        products: { $size: "$productItems" }
      }
    },
    { $project: { productItems: 0 } },
    { $sort: { displayOrder: 1, name: 1 } }
  ]);

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: { categories },
  });
});

// @desc    Lấy chi tiết danh mục theo slug
// @route   GET /api/v1/categories/:slug
// @access  Public
export const getCategoryBySlug = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    slug: req.params.slug,
    isActive: true,
  }).lean();

  if (!category) {
    return next(new AppError("Không tìm thấy danh mục", 404));
  }

  res.status(200).json({
    status: "success",
    data: { category },
  });
});

// @desc    Tạo danh mục mới
// @route   POST /api/v1/categories
// @access  Private (Admin)
export const createCategory = catchAsync(async (req, res, next) => {
  const { name, parentId, description, imageBanner, icon, displayOrder } =
    req.body;

  const slug = slugify(name);

  // Xử lý parent nếu có
  let level = 1;
  let path = slug;

  if (parentId) {
    const parent = await Category.findById(parentId);
    if (!parent) {
      return next(new AppError("Danh mục cha không tồn tại", 400));
    }
    level = parent.level + 1;
    if (level > 5) {
      return next(new AppError("Danh mục không được sâu quá 5 cấp", 400));
    }
    path = parent.path ? `${parent.path}/${slug}` : slug;
  }

  const category = await Category.create({
    name,
    slug,
    parentId: parentId || null,
    level,
    path,
    description,
    imageBanner,
    icon,
    displayOrder,
  });

  res.status(201).json({
    status: "success",
    data: { category },
  });
});

// @desc    Cập nhật danh mục
// @route   PATCH /api/v1/categories/:id
// @access  Private (Admin)
export const updateCategory = catchAsync(async (req, res, next) => {
  const updates = { ...req.body };

  // Nếu đổi tên thì tạo lại slug
  if (updates.name) {
    updates.slug = slugify(updates.name);
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError("Không tìm thấy danh mục", 404));
  }

  res.status(200).json({
    status: "success",
    data: { category },
  });
});

// @desc    Xóa mềm danh mục (Toggle isActive)
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Không tìm thấy danh mục", 404));
  }

  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json({
    status: "success",
    message: category.isActive ? "Đã khôi phục danh mục" : "Đã vô hiệu hóa danh mục",
    data: { category }
  });
});
