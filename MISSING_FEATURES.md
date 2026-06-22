# Danh sách các tính năng/trang còn thiếu trong dự án Tech Store

Dự án hiện đã hoàn thiện phần lớn cấu trúc cơ bản và các API backend (Models, Routes, Controllers đều đã có sẵn). Tuy nhiên, để có một luồng mua hàng (e-commerce flow) hoàn chỉnh, dự án cần bổ sung các phần sau:

## 1. Frontend (Client)

### 1.1. Các trang (Pages)
- **Trang Giỏ hàng (Cart Page - `client/src/pages/Cart.jsx`):** 
  - File hiện đang trống.
  - Cần giao diện để hiển thị danh sách sản phẩm trong giỏ, thay đổi số lượng, xóa sản phẩm.
  - Tính toán tạm tính, phí ship, tổng tiền và nút chuyển hướng đến trang Thanh toán.
  
- **Trang Thanh toán (Checkout Page - `client/src/pages/Checkout.jsx`):** 
  - File hiện đang trống.
  - Cần form nhập thông tin giao hàng (họ tên, số điện thoại, địa chỉ).
  - Lựa chọn phương thức thanh toán (Thanh toán khi nhận hàng - COD, Chuyển khoản, v.v.).
  - Bảng tóm tắt đơn hàng và nút "Đặt hàng".

- **Trang Hồ sơ Cá nhân / Lịch sử Đơn hàng (User Profile / Order History):** 
  - Chưa có file component cho trang này (cần tạo thêm ví dụ `client/src/pages/Profile.jsx`).
  - Cần trang để người dùng xem/cập nhật thông tin cá nhân.
  - Xem danh sách các đơn hàng đã đặt và theo dõi trạng thái đơn hàng (Pending, Shipped, Delivered).

### 1.2. State Management & API Services
- **Cart State (Redux):** Cần tạo slice trong Redux (ví dụ: `cartSlice.js` hoặc quản lý thông qua context) để lưu trữ và hiển thị số lượng sản phẩm trên icon Giỏ hàng ở Navbar.
- **Cart & Order Services:** Cần tạo các hàm gọi API (`client/src/services/cart.service.js` và `order.service.js`) bằng Axios để giao tiếp với các API `/api/v1/cart` và `/api/v1/orders` đã có sẵn ở backend.

### 1.3. Bảo mật & Tối ưu hóa
- [x] Day 22: Kiểm tra dữ liệu đầu vào chặt chẽ cả ở Client (HTML5 Validation) và Server (Mongoose/Validators) trước khi ghi DB.

---

## 2. Backend (Server)

### 2.1. Admin Dashboard Controller
- **`server/controllers/dashboard.controllers.js`:** 
  - File hiện đã được tạo nhưng đang trống.
  - Cần triển khai API thống kê (ví dụ: `getDashboardStats`) để trả về dữ liệu tổng quan cho Admin Dashboard (tổng doanh thu, tổng số đơn hàng, tổng số người dùng mới, top sản phẩm bán chạy).

### 2.2. Thanh toán trực tuyến (Tùy chọn nâng cao)
- Backend hiện đã có logic xử lý đơn hàng cơ bản, nhưng nếu muốn dự án thực tế hơn, bạn nên tích hợp các cổng thanh toán (Payment Gateway) như **Stripe**, **PayPal** hoặc **VNPay/Momo**.

---

## 3. Đề xuất quy trình triển khai tiếp theo (Next Steps)
1. **Hoàn thiện luồng Giỏ hàng:** Setup Redux store cho Cart, xây dựng giao diện trang `Cart.jsx`, gọi API thêm/sửa/xóa sản phẩm trong giỏ.
2. **Hoàn thiện luồng Đặt hàng:** Xây dựng giao diện trang `Checkout.jsx`, truyền dữ liệu giỏ hàng sang, gọi API tạo đơn hàng (Create Order) và xóa giỏ hàng sau khi đặt thành công.
3. **Trang cá nhân:** Xây dựng trang `Profile.jsx` cho phép người mua theo dõi lịch sử đơn hàng của họ.
4. **Dashboard Data:** Viết logic trong `dashboard.controllers.js` để trả về số liệu thống kê thực tế cho trang Admin Dashboard.
