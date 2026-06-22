import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Tạo đơn hàng mới (Checkout)
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
    return next(new AppError("Vui lòng cung cấp đầy đủ địa chỉ giao hàng", 400));
  }

  // 1. Lấy giỏ hàng của user hiện tại
  const cart = await Cart.findOne({ userId: req.userId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Giỏ hàng của bạn đang trống", 400));
  }

  let totalAmount = 0;
  const orderItems = [];

  // 2. Kiểm tra tồn kho và tính tổng tiền
  for (const item of cart.items) {
    const product = item.productId;

    if (!product) {
      return next(new AppError("Một sản phẩm trong giỏ hàng không còn tồn tại", 404));
    }

    if (product.stock < item.quantity) {
      return next(new AppError(`Sản phẩm ${product.name} không đủ số lượng trong kho (chỉ còn ${product.stock})`, 400));
    }

    // Tính tiền
    totalAmount += product.price * item.quantity;

    // Chuẩn bị item cho Order
    orderItems.push({
      productId: product._id,
      name: product.name,
      image: product.thumbnail || (product.images && product.images.length > 0 ? product.images[0] : ""),
      price: product.price, // Chốt giá tại thời điểm mua
      quantity: item.quantity,
    });
  }

  // 3. Trừ kho sản phẩm
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: {
        stock: -item.quantity,
        soldCount: item.quantity,
      },
    });
  }

  // 4. Tạo Order
  const order = await Order.create({
    userId: req.userId,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
    status: "PENDING",
  });

  // 5. Làm trống giỏ hàng sau khi đặt hàng thành công
  cart.items = [];
  await cart.save();

  res.status(201).json({
    status: "success",
    data: {
      order,
    },
  });
});

// @desc    Lấy danh sách đơn hàng của user đang đăng nhập
// @route   GET /api/v1/orders
// @access  Private
export const getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});
