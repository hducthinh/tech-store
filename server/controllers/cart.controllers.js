import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Lấy giỏ hàng của user hiện tại
// @route   GET /api/v1/cart
// @access  Private
export const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ userId: req.userId }).populate("items.productId", "name price images thumbnail stock slug");

  // Nếu user chưa có giỏ hàng, tạo mới một giỏ trống
  if (!cart) {
    cart = await Cart.create({ userId: req.userId, items: [] });
  }

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/v1/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, buildId = null } = req.body;

  if (!productId) {
    return next(new ApiError("Vui lòng cung cấp ID sản phẩm", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("Không tìm thấy sản phẩm", 404));
  }

  if (!product.isActive) {
    return next(new ApiError("Sản phẩm này hiện đã ngừng kinh doanh hoặc bị ẩn", 400));
  }

  if (product.stock < quantity) {
    return next(new ApiError(`Số lượng trong kho không đủ, chỉ còn ${product.stock} sản phẩm`, 400));
  }

  let cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    cart = new Cart({ userId: req.userId, items: [] });
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ chưa (cùng buildId)
  const itemIndex = cart.items.findIndex(item => 
    item.productId.toString() === productId && 
    (item.buildId || null) === (buildId || null)
  );

  if (itemIndex > -1) {
    // Nếu có rồi, cộng thêm số lượng
    const newQuantity = cart.items[itemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      return next(new ApiError(`Số lượng trong kho không đủ, chỉ còn ${product.stock} sản phẩm`, 400));
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    // Thêm mới
    cart.items.push({ productId, quantity, buildId });
  }

  await cart.save();

  // Populate lại để trả về thông tin đầy đủ cho frontend
  await cart.populate("items.productId", "name price images thumbnail stock slug");

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

// @desc    Cập nhật số lượng sản phẩm trong giỏ
// @route   PATCH /api/v1/cart/update-quantity
// @access  Private
export const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { productId, quantity, buildId = null } = req.body;

  if (!productId || quantity === undefined) {
    return next(new ApiError("Vui lòng cung cấp productId và quantity", 400));
  }

  if (quantity < 1) {
    return next(new ApiError("Số lượng phải lớn hơn 0", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("Không tìm thấy sản phẩm", 404));
  }

  if (!product.isActive) {
    return next(new ApiError("Sản phẩm này hiện đã ngừng kinh doanh hoặc bị ẩn", 400));
  }

  if (product.stock < quantity) {
    return next(new ApiError(`Số lượng trong kho không đủ, chỉ còn ${product.stock} sản phẩm`, 400));
  }

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    return next(new ApiError("Không tìm thấy giỏ hàng", 404));
  }

  const itemIndex = cart.items.findIndex(item => 
    item.productId.toString() === productId && 
    (item.buildId || null) === (buildId || null)
  );
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate("items.productId", "name price images thumbnail stock slug");

    res.status(200).json({
      status: "success",
      data: {
        cart,
      },
    });
  } else {
    return next(new ApiError("Sản phẩm không có trong giỏ hàng", 404));
  }
});

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/v1/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { buildId = null } = req.query;

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    return next(new ApiError("Không tìm thấy giỏ hàng", 404));
  }

  cart.items = cart.items.filter(item => {
    const isSameProduct = item.productId.toString() === productId;
    const isSameBuild = (item.buildId || null) === (buildId || null);
    return !(isSameProduct && isSameBuild);
  });
  await cart.save();
  await cart.populate("items.productId", "name price images thumbnail stock slug");

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/v1/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    status: "success",
    message: "Đã làm trống giỏ hàng",
    data: {
      cart,
    },
  });
});
