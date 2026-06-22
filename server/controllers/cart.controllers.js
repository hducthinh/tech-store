import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Lấy giỏ hàng của user hiện tại
// @route   GET /api/v1/cart
// @access  Private
export const getCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ userId: req.userId }).populate("items.productId", "name price images thumbnail stock");

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
export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return next(new AppError("Vui lòng cung cấp ID sản phẩm", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Không tìm thấy sản phẩm", 404));
  }

  if (product.stock < quantity) {
    return next(new AppError("Sản phẩm không đủ số lượng trong kho", 400));
  }

  let cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    cart = new Cart({ userId: req.userId, items: [] });
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ chưa
  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

  if (itemIndex > -1) {
    // Nếu có rồi, cộng thêm số lượng
    const newQuantity = cart.items[itemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      return next(new AppError("Số lượng vượt quá số lượng tồn kho", 400));
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    // Thêm mới
    cart.items.push({ productId, quantity });
  }

  await cart.save();

  // Populate lại để trả về thông tin đầy đủ cho frontend
  await cart.populate("items.productId", "name price images thumbnail stock");

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
export const updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return next(new AppError("Vui lòng cung cấp productId và quantity", 400));
  }

  if (quantity < 1) {
    return next(new AppError("Số lượng phải lớn hơn 0", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Không tìm thấy sản phẩm", 404));
  }

  if (product.stock < quantity) {
    return next(new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho`, 400));
  }

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    return next(new AppError("Không tìm thấy giỏ hàng", 404));
  }

  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate("items.productId", "name price images thumbnail stock");

    res.status(200).json({
      status: "success",
      data: {
        cart,
      },
    });
  } else {
    return next(new AppError("Sản phẩm không có trong giỏ hàng", 404));
  }
});

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/v1/cart/:productId
// @access  Private
export const removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    return next(new AppError("Không tìm thấy giỏ hàng", 404));
  }

  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  await cart.save();
  await cart.populate("items.productId", "name price images thumbnail stock");

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
export const clearCart = catchAsync(async (req, res, next) => {
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
