import Order from "../models/order.model.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Xử lý Webhook từ SePay khi có giao dịch
// @route   POST /api/v1/payments/sepay-webhook
// @access  Public
export const sepayWebhook = async (req, res, next) => {
  console.log("[SePay Webhook] Nhận dữ liệu:", req.body);

  // Bảo mật: Kiểm tra API Key từ SePay
  if (process.env.SEPAY_API_KEY) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.includes(process.env.SEPAY_API_KEY)) {
      console.log("[SePay Webhook] Bị từ chối vì sai API Key hoặc không có xác thực.");
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid API Key" });
    }
  }

  // 1. Theo sơ đồ SePay: Trả về HTTP 200 ngay lập tức khi nhận được webhook
  // để hệ thống SePay xác nhận là đã gửi thành công và không thử gửi lại.
  res.status(200).json({ success: true, message: "Webhook received" });

  // 2. Xử lý dữ liệu chạy ngầm
  try {
    const { transferType, transferAmount, content } = req.body;

    // Kiểm tra nội dung chuyển khoản: Không hợp lệ -> Bỏ qua giao dịch
    if (transferType !== "in" || !content) {
      console.log("[SePay Webhook] Bỏ qua giao dịch không hợp lệ hoặc tiền ra.");
      return;
    }

    const codeMatch = content.match(/TKPHDT\s*([a-zA-Z0-9]{6})\b/i);
    
    if (!codeMatch) {
      console.log("[SePay Webhook] Không tìm thấy mã đơn hàng trong nội dung:", content);
      return;
    }

    const orderCode = codeMatch[1].toLowerCase();

    // 3. Tìm đơn hàng có đuôi _id giống với orderCode
    // Cách an toàn nhất: Lấy các đơn chưa thanh toán và lọc bằng Javascript để tránh lỗi $expr của MongoDB
    const unpaidOrders = await Order.find({
      paymentMethod: "BANK_TRANSFER",
      isPaid: false
    });

    const order = unpaidOrders.find(o => o._id.toString().toLowerCase().endsWith(orderCode));

    if (!order) {
      console.log(`[SePay Webhook] Không tìm thấy đơn hàng chờ thanh toán với mã ${orderCode}`);
      return;
    }

    // Xử lý thành công -> Kiểm tra số tiền
    if (Number(transferAmount) < order.totalAmount) {
      console.log(`[SePay Webhook] Đơn ${orderCode} chuyển thiếu tiền (Cần ${order.totalAmount}, Nhận ${transferAmount})`);
      // Ghi log lỗi / Xử lý thủ công
      order.statusHistory.push({
        status: order.status,
        note: `Khách chuyển khoản thiếu: Nhận được ${transferAmount}đ qua SePay. Cần ${order.totalAmount}đ.`
      });
      await order.save();
      return;
    }

    // Cập nhật đơn hàng / Kích hoạt dịch vụ
    order.isPaid = true;
    order.paidAt = new Date();
    
    if (order.status === "PENDING" || order.status === "PENDING_PAYMENT") {
      order.status = "PROCESSING";
      order.statusHistory.push({
        status: "PROCESSING",
        note: `Thanh toán tự động thành công qua SePay (${transferAmount}đ).`
      });
    } else {
      order.statusHistory.push({
        status: order.status,
        note: `Thanh toán muộn thành công qua SePay (${transferAmount}đ).`
      });
    }

    await order.save();
    console.log(`[SePay Webhook] Đã xác nhận thanh toán thành công cho đơn hàng ${orderCode}`);

  } catch (error) {
    // Xử lý không thành công -> Ghi log lỗi
    console.error("[SePay Webhook] Lỗi khi xử lý dữ liệu:", error);
  }
};
