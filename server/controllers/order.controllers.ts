// @ts-nocheck
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// @desc    Tạo đơn hàng mới (Checkout)
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod, selectedItemIds } = req.body;

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
    return next(new ApiError("Vui lòng cung cấp đầy đủ địa chỉ giao hàng", 400));
  }

  if (!selectedItemIds || !Array.isArray(selectedItemIds) || selectedItemIds.length === 0) {
    return next(new ApiError("Vui lòng chọn ít nhất một sản phẩm để thanh toán", 400));
  }

  // 1. Lấy giỏ hàng của user hiện tại
  const cart = await Cart.findOne({ userId: req.userId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    return next(new ApiError("Giỏ hàng của bạn đang trống", 400));
  }

  const selectedItemsToCheckout = cart.items.filter(item => {
    // Client mới sẽ gửi lên item._id
    if (selectedItemIds.includes(item._id.toString())) return true;
    // Tương thích ngược với client cũ gửi lên productId
    if (item.productId && selectedItemIds.includes(item.productId._id.toString())) return true;
    return false;
  });

  if (selectedItemsToCheckout.length === 0) {
    return next(new ApiError("Không có sản phẩm hợp lệ nào được chọn để thanh toán", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const orderItems = [];

    // 2 & 3. Kiểm tra tồn kho, trừ kho an toàn (Atomic + Transaction) và tính tổng tiền
    for (const item of selectedItemsToCheckout) {
      const product = item.productId;
      if (!product || !product.isActive) {
        throw new ApiError(`Sản phẩm ${product?.name || 'đã chọn'} hiện đã ngừng kinh doanh hoặc bị ẩn.`, 400);
      }

      // Trừ kho nguyên tử. Nếu trong tíc tắc có người mua mất, updatedProduct sẽ null
      const updatedProduct = await Product.findOneAndUpdate(
        { 
          _id: product._id, 
          stock: { $gte: item.quantity },
          isActive: true
        },
        {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity,
          },
        },
        { new: true, session }
      );

      if (!updatedProduct) {
        throw new ApiError(`Đặt hàng thất bại do sản phẩm ${product.name} vừa hết hàng hoặc không đủ số lượng.`, 400);
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

    // 4. Tạo Order
    // Lưu ý: create() khi truyền session phải nhận array data []
    const [order] = await Order.create([{
      userId: req.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: "PENDING",
    }], { session });

    // 5. Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
    const checkoutItemIds = selectedItemsToCheckout.map(item => item._id.toString());
    cart.items = cart.items.filter(item => !checkoutItemIds.includes(item._id.toString()));
    await cart.save({ session });

    // Commit toàn bộ giao dịch
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: "success",
      data: {
        order,
      },
    });

  } catch (error) {
    // Nếu có bất kỳ lỗi nào, Rollback lại toàn bộ
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});

// @desc    Lấy danh sách đơn hàng của user đang đăng nhập
// @route   GET /api/v1/orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

// @desc    Lấy toàn bộ danh sách đơn hàng cho Admin
// @route   GET /api/v1/orders/admin
// @access  Private/Admin
export const getAdminOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate("userId", "fullName email phone")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

// @desc    Lấy chi tiết 1 đơn hàng của khách hàng
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.userId });

  if (!order) {
    return next(new ApiError("Không tìm thấy đơn hàng", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

// @desc    Cập nhật trạng thái đơn hàng
// @route   PATCH /api/v1/orders/admin/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ["PENDING_PAYMENT", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"];

  if (!validStatuses.includes(status)) {
    return next(new ApiError("Trạng thái đơn hàng không hợp lệ", 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError("Không tìm thấy đơn hàng", 404));
  }

  // Chặn đi lùi nếu đơn hàng đã đóng (COMPLETED hoặc CANCELLED)
  if (order.status === "COMPLETED" || order.status === "CANCELLED") {
    return next(new ApiError(`Không thể thay đổi trạng thái vì đơn hàng đã được chốt là ${order.status}`, 400));
  }

  const currentIndex = validStatuses.indexOf(order.status);
  const newIndex = validStatuses.indexOf(status);

  // Chặn đi lùi trạng thái (trừ trường hợp hủy đơn - CANCELLED có thể nhảy từ bất kỳ đâu trước khi COMPLETED)
  if (newIndex <= currentIndex && status !== "CANCELLED") {
    return next(new ApiError("Không thể lùi trạng thái hoặc cập nhật lại trạng thái hiện tại", 400));
  }

  order.status = status;
  await order.save();

  res.status(200).json({
    status: "success",
    message: "Đã cập nhật trạng thái đơn hàng",
    data: {
      order,
    },
  });
});

// @desc    Khách hàng tự hủy đơn hàng
// @route   POST /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.userId;

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    return next(new ApiError("Không tìm thấy đơn hàng", 404));
  }

  // Các trạng thái được phép hủy
  const cancellableStatuses = ["PENDING_PAYMENT", "PENDING", "CONFIRMED"];

  if (!cancellableStatuses.includes(order.status)) {
    return next(new ApiError("Đơn hàng đang trong trạng thái không thể hủy", 400));
  }

  // Hoàn lại stock và giảm soldCount
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: {
        stock: item.quantity,
        soldCount: -item.quantity,
      },
    });
  }

  order.status = "CANCELLED";
  order.statusHistory.push({
    status: "CANCELLED",
    note: "Khách hàng tự hủy đơn hàng",
  });
  
  await order.save();

  res.status(200).json({
    status: "success",
    message: "Đã hủy đơn hàng thành công",
    data: {
      order,
    },
  });
});

// @desc    Admin xác nhận đã nhận tiền (chuyển khoản thủ công)
// @route   PATCH /api/v1/orders/admin/:id/confirm-payment
// @access  Private/Admin
export const confirmPayment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new ApiError("Không tìm thấy đơn hàng", 404));
  }

  if (order.isPaid) {
    return next(new ApiError("Đơn hàng này đã được xác nhận thanh toán trước đó", 400));
  }

  order.isPaid = true;
  order.paidAt = new Date();
  
  if (order.status === "PENDING" || order.status === "PENDING_PAYMENT") {
    order.status = "PROCESSING";
    order.statusHistory.push({
      status: "PROCESSING",
      note: "Admin đã xác nhận nhận được thanh toán chuyển khoản.",
    });
  } else {
    order.statusHistory.push({
      status: order.status,
      note: "Admin đã xác nhận nhận được thanh toán chuyển khoản (Thanh toán muộn).",
    });
  }

  await order.save();

  res.status(200).json({
    status: "success",
    message: "Xác nhận thanh toán thành công",
    data: {
      order,
    },
  });
});
