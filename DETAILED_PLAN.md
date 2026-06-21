# KẾ HOẠCH HOÀN THIỆN DỰ ÁN TECH_STORE (30 NGÀY CHI TIẾT)

Tài liệu này vạch ra lộ trình hoàn thiện chi tiết từng ngày cho dự án E-commerce Tech Store sử dụng cấu trúc MERN Stack (MongoDB, Express, React, Node.js). Lộ trình này được tùy biến dựa trên thiết kế trong file `Tech_Store.pdf` kết hợp với hiện trạng code đã xây dựng trong repository.

---

## 🛠 NGUYÊN TẮC PHÁT TRIỂN (PONYTAIL RULES)
Trong suốt quá trình code, chúng ta cần tuân thủ triệt để các nguyên tắc sau:
1. **YAGNI (You Aren't Gonna Need It):** Chỉ xây dựng những gì được yêu cầu trong ngày hôm đó. Không viết code scaffolding hoặc các trừu tượng hóa suy đoán cho tương lai.
2. **Ưu tiên Native & Stdlib:** Sử dụng các tính năng sẵn có của trình duyệt và ngôn ngữ (ví dụ: `<input type="date">` thay vì thư viện datepicker, fetch hoặc axios đã có thay vì cài thêm libs quản lý state phức tạp, v.v.).
3. **Giải pháp Đơn giản Nhất:** Luôn ưu tiên cách viết ngắn nhất, dễ hiểu nhất nhưng vẫn đảm bảo tính đúng đắn và bảo mật.
4. **Không bỏ qua Core Quality:** Mặc dù tối giản nhưng không được cắt bớt validation biên, xử lý lỗi (error handling), bảo mật và khả năng tương thích hiển thị di động.
5. **Ghi chú Shortcut:** Nếu sử dụng phương án tạm thời (ví dụ: in-memory rate limiter thay vì Redis), phải để lại comment dạng `// ponytail: [lý do & cách nâng cấp]`.

---

## 📊 TIẾN ĐỘ TỔNG QUAN

- **Trạng thái:** 🔄 In Progress
- **Tiến độ:** 4/30 Tasks (13%)
- **Mục tiêu tiếp theo:** Hoàn thành hệ thống Sản phẩm (Product Backend & Frontend)

---

## 📅 LỘ TRÌNH CHI TIẾT TỪNG NGÀY

### PHASE 1: FOUNDATION & SETUP (DAYS 1-7)

#### ⬜ Day 1 — Khởi tạo dự án
- **Trạng thái:** ✅ Đã hoàn thành
- **Các file liên quan:** [package.json](file:///d:/personal/tech-store/package.json), [client/package.json](file:///d:/personal/tech-store/client/package.json), [server/package.json](file:///d:/personal/tech-store/server/package.json)
- **Chi tiết thực hiện:**
  - Khởi tạo thư mục dự án và git.
  - Setup phía server với Express, Mongoose, dotenv.
  - Setup phía client với Vite + React v19, Tailwind CSS v4, React Router v7.

#### ⬜ Day 2 — Thiết kế Database (Database Design)
- **Trạng thái:** 🔄 Đang thực hiện (Cần bổ sung các schema còn thiếu)
- **Các file liên quan:**
  - [user.model.js](file:///d:/personal/tech-store/server/models/user.model.js) (Đã xong)
  - [product.model.js](file:///d:/personal/tech-store/server/models/product.model.js) (Đã xong)
  - [category.model.js](file:///d:/personal/tech-store/server/models/category.model.js) (Đã xong)
  - [brand.model.js](file:///d:/personal/tech-store/server/models/brand.model.js) (Đã xong)
  - [cart.model.js](file:///d:/personal/tech-store/server/models/cart.model.js) (Chưa làm - đang rỗng)
  - [order.model.js](file:///d:/personal/tech-store/server/models/order.model.js) (Chưa làm - đang rỗng)
- **Chi tiết thực hiện:**
  - Định nghĩa Mongoose schema cho `Cart` (Giỏ hàng): Liên kết với `userId` (ref User) và mảng các `items` gồm `productId` (ref Product), `quantity` (Number), và `selectedSpecs` (Map).
  - Định nghĩa Mongoose schema cho `Order` (Đơn hàng): Gồm thông tin khách hàng, danh sách sản phẩm mua (chụp lại giá tại thời điểm mua), địa chỉ giao hàng, phương thức thanh toán, tổng tiền, trạng thái thanh toán (`isPaid`), trạng thái giao hàng (`isDelivered`), và lịch sử trạng thái đơn hàng.
  - *Chỉ dẫn Ponytail:* Viết schema gọn gàng, sử dụng `timestamps: true` để MongoDB tự động quản lý thời gian cập nhật.

#### ⬜ Day 3 — Authentication Backend
- **Trạng thái:** ✅ Đã hoàn thành
- **Các file liên quan:**
  - [auth.controllers.js](file:///d:/personal/tech-store/server/controllers/auth.controllers.js)
  - [auth.routes.js](file:///d:/personal/tech-store/server/routes/v1/auth.routes.js)
  - [verifyToken.js](file:///d:/personal/tech-store/server/middlewares/verifyToken.js)
  - [validators.js](file:///d:/personal/tech-store/server/utils/validators.js)
- **Chi tiết thực hiện:**
  - Xây dựng API Đăng ký (`POST /api/v1/auth/register`) có kiểm tra email/sđt trùng và mã hóa mật khẩu bằng bcryptjs.
  - Xây dựng API Đăng nhập (`POST /api/v1/auth/login`) sinh JWT token trả về client.
  - Xây dựng API Lấy thông tin cá nhân (`GET /api/v1/auth/profile`) sử dụng middleware `verifyToken` xác thực JWT từ Header.

#### ⬜ Day 4 — Authentication Frontend
- **Trạng thái:** ✅ Đã hoàn thành
- **Các file liên quan:**
  - [AuthContext.jsx](file:///d:/personal/tech-store/client/src/contexts/AuthContext.jsx)
  - [Login.jsx](file:///d:/personal/tech-store/client/src/pages/Login.jsx)
  - [Register.jsx](file:///d:/personal/tech-store/client/src/pages/Register.jsx)
  - [RegisterForm.jsx](file:///d:/personal/tech-store/client/src/components/auth/RegisterForm.jsx)
- **Chi tiết thực hiện:**
  - Triển khai `AuthContext` quản lý token trong `localStorage`, cung cấp các hàm `login`, `register`, `logout` và trạng thái `user`, `isLoading`, `error`.
  - Thiết kế trang Đăng nhập và Đăng ký sử dụng form Tailwind CSS đẹp mắt, xử lý validation và hiển thị lỗi trực quan từ server.

#### ⬜ Day 5 — Product Backend
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/controllers/product.controllers.js` (Tạo mới)
  - `server/routes/v1/product.routes.js` (Tạo mới)
  - `server/index.js` (Chỉnh sửa để đăng ký route)
- **Chi tiết thực hiện:**
  - Phát triển API lấy danh sách sản phẩm: `GET /api/v1/products` hỗ trợ lọc theo danh mục (`categoryId`), thương hiệu (`brandId`), khoảng giá (`minPrice`, `maxPrice`), sắp xếp (`sortBy = price_asc | price_desc | soldCount_desc | rating_desc`).
  - API lấy sản phẩm nổi bật: `GET /api/v1/products/featured`.
  - API lấy chi tiết sản phẩm bằng slug: `GET /api/v1/products/:slug`.
  - *Chỉ dẫn Ponytail:* Tránh sử dụng các thư viện query builder phức tạp. Viết đối tượng bộ lọc MongoDB thủ công từ `req.query`.

#### ⬜ Day 6 — Product Frontend
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `client/src/pages/ProductList.jsx` (Tạo mới)
  - `client/src/pages/ProductDetail.jsx` (Tạo mới)
  - [App.jsx](file:///d:/personal/tech-store/client/src/App.jsx) (Chỉnh sửa đăng ký route)
- **Chi tiết thực hiện:**
  - `ProductList.jsx`: Thiết kế layout lưới (Grid) hiển thị thẻ sản phẩm (hình ảnh, tên, giá bán, giá cũ gạch ngang, đánh giá sao, nút thêm nhanh vào giỏ). Sidebar lọc theo danh mục, hãng và giá.
  - `ProductDetail.jsx`: Hiển thị chi tiết thông tin sản phẩm, cấu hình kỹ thuật (`specs` dạng bảng), bộ sưu tập hình ảnh, chọn số lượng và nút "Thêm vào giỏ hàng".

#### ⬜ Day 7 — Category + Search
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/controllers/category.controllers.js` & `server/routes/v1/category.routes.js` (Tạo mới)
  - `server/controllers/brand.controllers.js` & `server/routes/v1/brand.routes.js` (Tạo mới)
  - `client/src/components/common/Header.jsx` (Chỉnh sửa để thêm thanh tìm kiếm)
- **Chi tiết thực hiện:**
  - Backend: API trả về toàn bộ danh mục và thương hiệu để hiển thị trên menu/bộ lọc. API tìm kiếm `GET /api/v1/products/search?q=...` sử dụng Text Index của MongoDB trên trường `name` và `shortDescription`.
  - Frontend: Thêm thanh tìm kiếm trên Header. Khi gõ từ khóa và ấn Enter sẽ chuyển hướng sang trang `/products?search=tu_khoa` để hiển thị kết quả.

---

### PHASE 2: CORE FEATURES (DAYS 8-15)

#### ⬜ Day 8 — Cart System Backend
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - [cart.model.js](file:///d:/personal/tech-store/server/models/cart.model.js) (Chỉnh sửa)
  - `server/controllers/cart.controllers.js` (Tạo mới)
  - `server/routes/v1/cart.routes.js` (Tạo mới)
- **Chi tiết thực hiện:**
  - Hiện thực hóa Cart model đã thiết kế ở Day 2.
  - Viết các API cho giỏ hàng (yêu cầu verifyToken):
    - `GET /api/v1/cart`: Lấy giỏ hàng của user hiện tại, sử dụng `.populate('items.productId')` để lấy thông tin ảnh, tên, giá sản phẩm.
    - `POST /api/v1/cart`: Thêm sản phẩm hoặc cập nhật số lượng của sản phẩm trong giỏ.
    - `DELETE /api/v1/cart/:productId`: Xóa 1 sản phẩm khỏi giỏ hàng.
    - `DELETE /api/v1/cart`: Làm trống toàn bộ giỏ hàng.

#### ⬜ Day 9 — Cart UI
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `client/src/pages/Cart.jsx` (Tạo mới)
  - `client/src/contexts/CartContext.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Xây dựng `CartContext` hoặc Redux slice để quản lý giỏ hàng trên frontend, tự động đồng bộ giỏ hàng với server khi người dùng đăng nhập.
  - Thiết kế trang Giỏ hàng `/cart`: Hiển thị danh sách sản phẩm trong giỏ, cho phép tăng/giảm số lượng trực tiếp (có cập nhật API), hiển thị tạm tính, tiền ship, tổng tiền và nút "Tiến hành thanh toán".

#### ⬜ Day 10 — Checkout (Thanh toán)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `client/src/pages/Checkout.jsx` (Tạo mới)
  - `server/controllers/order.controllers.js` & `server/routes/v1/order.routes.js` (Tạo mới)
- **Chi tiết thực hiện:**
  - Backend: API `POST /api/v1/orders` cho phép tạo đơn hàng mới. Thuật toán xử lý:
    1. Kiểm tra tồn kho của từng sản phẩm.
    2. Tính toán tổng số tiền dựa trên giá hiện tại trong Database (không tin cậy giá client gửi lên).
    3. Tạo bản ghi đơn hàng mới với trạng thái "Chờ thanh toán".
    4. Trừ số lượng tồn kho (`stock`) và tăng số lượng đã bán (`soldCount`) của sản phẩm.
    5. Xóa sạch giỏ hàng của user.
  - Frontend: Trang thanh toán `/checkout` gồm Form nhập địa chỉ giao hàng, số điện thoại người nhận, chọn phương thức thanh toán (COD / thẻ nội địa giả lập), hiển thị tóm tắt đơn hàng và nút "Đặt hàng".

#### ⬜ Day 11 — Order History (Lịch sử mua hàng)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `client/src/pages/OrderHistory.jsx` (Tạo mới)
  - `server/controllers/order.controllers.js` (Chỉnh sửa để thêm API lấy danh sách đơn của user)
- **Chi tiết thực hiện:**
  - Backend: Endpoint `GET /api/v1/orders/my-orders` để trả về danh sách đơn hàng đã mua của user hiện tại.
  - Frontend: Trang lịch sử đơn hàng `/orders` hiển thị danh sách đơn dạng dòng thời gian, trạng thái (Chờ xử lý, Đang giao, Đã giao, Đã hủy) và chi tiết các mặt hàng trong mỗi đơn.

#### ⬜ Day 12 — Admin Authentication & Layout
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/middlewares/verifyAdmin.js` (Tạo mới)
  - `client/src/components/layouts/AdminLayout.jsx` (Chỉnh sửa)
  - `client/src/pages/admin/Dashboard.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Backend: Viết middleware `verifyAdmin` kiểm tra `req.user.role === 'admin'`. Gắn middleware này vào tất cả các route quản lý của admin.
  - Frontend: Thiết kế `AdminLayout` có Sidebar chứa các liên kết quản lý (Dashboard, Sản phẩm, Danh mục, Đơn hàng, Người dùng). Chặn quyền truy cập của người dùng thường thông qua Route bảo vệ trong React Router.

#### ⬜ Day 13 — Admin Product CRUD
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/controllers/product.controllers.js` (Chỉnh sửa để thêm các hàm CRUD)
  - `client/src/pages/admin/ProductManagement.jsx` (Tạo mới)
  - `client/src/pages/admin/ProductForm.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Backend: Viết các API cho admin: `POST /api/v1/products` (Tạo sản phẩm mới), `PUT /api/v1/products/:id` (Cập nhật sản phẩm), `DELETE /api/v1/products/:id` (Xóa sản phẩm - có thể chuyển thành xóa mềm `isActive: false`).
  - Frontend: Thiết kế bảng hiển thị danh sách sản phẩm kèm theo bộ lọc nhanh. Trang form thêm/sửa sản phẩm hỗ trợ nhập specs (dạng Map key-value), link ảnh, chọn danh mục/thương hiệu, số lượng tồn kho.

#### ⬜ Day 14 — Admin Category & Brand CRUD
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/controllers/category.controllers.js` & `server/controllers/brand.controllers.js` (Cập nhật thêm CRUD)
  - `client/src/pages/admin/CategoryManagement.jsx` & `client/src/pages/admin/BrandManagement.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Backend: APIs tạo mới, cập nhật, và xóa các danh mục sản phẩm và thương hiệu (hãng sản xuất).
  - Frontend: Trang danh sách quản lý gọn gàng, sử dụng Modal đơn giản để thêm hoặc sửa nhanh tên danh mục/hãng mà không cần chuyển trang.

#### ⬜ Day 15 — Dashboard Statistics (Thống kê)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/controllers/dashboard.controllers.js` (Tạo mới)
  - `server/routes/v1/dashboard.routes.js` (Tạo mới)
  - `client/src/pages/admin/Dashboard.jsx` (Chỉnh sửa)
- **Chi tiết thực hiện:**
  - Backend: API dashboard trả về số liệu tổng quan: Tổng doanh thu (tổng tiền các đơn hàng đã thanh toán), Tổng số đơn hàng, Tổng số sản phẩm đang bán, Tổng số user khách hàng, danh sách 5 đơn hàng mới đặt nhất.
  - Frontend: Thiết kế các thẻ thống kê sang trọng (CSS gradient, shadow nhẹ). Vẽ biểu đồ doanh thu đơn giản bằng SVG thuần hoặc thư viện biểu đồ siêu nhẹ để hạn chế tối đa dependencies.

---

### PHASE 3: ADVANCED FEATURES (DAYS 16-23)

#### ⬜ Day 16 — Order Management (Quản lý đơn hàng của Admin)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/controllers/order.controllers.js` (Thêm API quản lý đơn)
  - `client/src/pages/admin/OrderManagement.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Backend: API `GET /api/v1/orders` lấy toàn bộ đơn hàng (hỗ trợ phân trang và lọc theo trạng thái). API `PUT /api/v1/orders/:id/status` cập nhật trạng thái đơn hàng (ví dụ: Chờ xử lý -> Đang giao -> Đã giao).
  - Frontend: Bảng quản lý đơn hàng cho Admin, cho phép xem chi tiết địa chỉ giao, đổi trạng thái đơn hàng thông qua dropdown và cập nhật tức thì.

#### ⬜ Day 17 — User Management (Quản lý người dùng của Admin)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/controllers/user.controllers.js` & `server/routes/v1/user.routes.js` (Tạo mới)
  - `client/src/pages/admin/UserManagement.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Backend: API `GET /api/v1/users` lấy danh sách tài khoản trong hệ thống. API `PUT /api/v1/users/:id/toggle-status` cho phép Admin khóa/mở khóa tài khoản khách hàng (`isActive = true/false`).
  - Frontend: Trang danh sách user dạng bảng, có nút Bật/Tắt trạng thái hoạt động của tài khoản khách hàng.

#### ⬜ Day 18 — Wishlist (Sản phẩm yêu thích)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - [user.model.js](file:///d:/personal/tech-store/server/models/user.model.js) (Chỉnh sửa trường wishlist)
  - `server/controllers/user.controllers.js` (Thêm API wishlist)
  - `client/src/pages/Wishlist.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Backend: Cấu hình thêm trường `wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]` vào schema User. Viết API thêm sản phẩm vào wishlist (`POST /api/v1/users/wishlist`) và xóa khỏi wishlist (`DELETE /api/v1/users/wishlist/:productId`).
  - Frontend: Trang hiển thị danh sách sản phẩm yêu thích của người dùng với layout grid gọn nhẹ, hỗ trợ thêm nhanh vào giỏ hoặc bỏ thích.

#### ⬜ Day 19 — Review System (Đánh giá & Bình luận)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - [product.model.js](file:///d:/personal/tech-store/server/models/product.model.js) (Thêm trường reviews)
  - `server/controllers/product.controllers.js` (Thêm API submit review)
  - `client/src/components/products/ReviewSection.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Backend: Thêm mảng `reviews` vào Product model (chứa userId, name, rating, comment, createdAt). API `POST /api/v1/products/:id/reviews` cho phép khách hàng đã đăng nhập viết bình luận và chấm điểm từ 1-5 sao. Khi tạo review, Backend phải tính toán lại trung bình cộng của `rating` và tổng số `reviewCount` trên sản phẩm.
  - Frontend: Phần đánh giá hiển thị ở cuối trang chi tiết sản phẩm, gồm danh sách các bình luận cũ và một biểu mẫu gửi đánh giá mới nếu user đã đăng nhập.

#### ⬜ Day 20 — Responsive UI (Tối ưu giao diện di động & Thẩm mỹ)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - [index.css](file:///d:/personal/tech-store/client/src/index.css) (Chỉnh sửa hệ thống design token)
  - Các component layouts, header, navbar.
- **Chi tiết thực hiện:**
  - Rà soát toàn bộ giao diện trên Mobile/Tablet. Đảm bảo thanh menu Header thu gọn thành menu Hamburger trên di động.
  - Nâng cấp trải nghiệm hình ảnh (Aesthetic UI): Sử dụng kính mờ (glassmorphism) cho header, hiệu ứng chuyển động mượt (micro-animations) khi rê chuột vào thẻ sản phẩm, màu sắc phối hợp hài hòa (dark mode nhẹ hoặc bảng màu HSL thanh lịch).

#### ⬜ Day 21 — Loading + Error Handling (Trải nghiệm chờ & Xử lý lỗi hệ thống)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `client/src/components/common/LoadingSkeleton.jsx` (Tạo mới)
  - `client/src/components/common/ErrorBoundary.jsx` (Tạo mới)
- **Chi tiết thực hiện:**
  - Xây dựng component `LoadingSkeleton` giả lập các khối thông tin sản phẩm đang tải thay vì để trang trắng hoặc dùng icon xoay truyền thống.
  - Xây dựng Error Boundary để bọc ứng dụng phía client, ngăn ngừa lỗi JS đơn lẻ làm sập toàn bộ ứng dụng React.

#### ⬜ Day 22 — Validation (Kiểm định đầu vào dữ liệu)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/utils/validators.js` (Chỉnh sửa)
  - Các component Form phía client (ProductForm, Checkout, v.v.)
- **Chi tiết thực hiện:**
  - Củng cố validation ở cả hai đầu: Client kiểm tra dữ liệu trước khi gửi để tránh phí request; Server kiểm tra nghiêm ngặt (trust boundaries) các trường bắt buộc, kiểu dữ liệu, định dạng số, độ dài chuỗi để đảm bảo dữ liệu MongoDB luôn sạch và đúng chuẩn.

#### ⬜ Day 23 — Security (Bảo mật ứng dụng)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - [index.js](file:///d:/personal/tech-store/server/index.js) (Chỉnh sửa)
- **Chi tiết thực hiện:**
  - Cấu hình các middleware bảo mật cho Express:
    - Bật CORS giới hạn domain cụ thể (`cors`).
    - Bật rate limiting giới hạn số request từ mỗi IP trong một khoảng thời gian (sử dụng `express-rate-limit` hoặc giải pháp tự viết gọn nhẹ) để chống tấn công brute-force/DDoS.
    - Chống tiêm nhiễm MongoDB query (NoSQL injection) bằng cách vệ sinh dữ liệu `req.body`, `req.params`.

---

### PHASE 4: OPTIMIZATION & DEPLOYMENT (DAYS 24-30)

#### ⬜ Day 24 — Pagination (Phân trang dữ liệu)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - `server/controllers/product.controllers.js` (Cập nhật hàm getProducts)
  - `client/src/pages/ProductList.jsx` (Cập nhật UI phân trang)
- **Chi tiết thực hiện:**
  - Chuyển đổi API danh sách sản phẩm từ tải toàn bộ sang phân trang sử dụng `skip` và `limit` của Mongoose. Trả về cấu trúc JSON gồm: `products`, `page`, `pages`, `totalProducts`.
  - Thiết kế thanh phân trang phía client (nút Trước, Sau, các số trang) hiển thị ở cuối danh sách sản phẩm.

#### ⬜ Day 25 — SEO cơ bản (Tối ưu công cụ tìm kiếm)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:**
  - [index.html](file:///d:/personal/tech-store/client/index.html)
  - Các trang `ProductDetail.jsx`, `Home.jsx`
- **Chi tiết thực hiện:**
  - Thiết lập thẻ tiêu đề (`title`) và mô tả (`description`) động.
  - *Chỉ dẫn Ponytail:* Không cần cài đặt thư viện React Helmet nặng nề. Sử dụng trực tiếp hiệu ứng phụ `useEffect` để can thiệp DOM: `document.title = product.name;` và cập nhật thuộc tính nội dung của thẻ `<meta name="description">` thông qua bộ chọn DOM thông thường.

#### ⬜ Day 26 — Testing (Kiểm thử chức năng)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:** Toàn bộ dự án
- **Chi tiết thực hiện:**
  - Chạy thử nghiệm toàn bộ luồng sử dụng của khách hàng: Đăng ký -> Đăng nhập -> Tìm sản phẩm -> Thêm vào giỏ -> Thanh toán -> Xem lịch sử đơn.
  - Chạy thử nghiệm luồng của Admin: Đăng nhập -> Vào Dashboard -> Thêm/sửa sản phẩm -> Quản lý đơn hàng -> Khóa tài khoản.
  - *Chỉ dẫn Ponytail:* Viết một file demo kiểm thử ngắn dạng `test_flow.js` ở root server để tự động hóa một số lệnh gọi API quan trọng mà không cần dựng framework test cồng kềnh.

#### ⬜ Day 27 — Bug Fix (Sửa lỗi tồn đọng)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:** Các file phát sinh lỗi
- **Chi tiết thực hiện:**
  - Thu thập logs lỗi, kiểm tra các trường hợp biên (như giỏ hàng trống, thanh toán lỗi mạng, token hết hạn đột ngột) và tiến hành sửa triệt để.

#### ⬜ Day 28 — Deploy Backend
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:** Configuration cho Render, các file `.env` môi trường production.
- **Chi tiết thực hiện:**
  - Setup database MongoDB Atlas trực tuyến.
  - Cấu hình server NodeJS để sẵn sàng deploy lên Render (hoặc Koyeb/Railway). Cập nhật các biến môi trường trực tuyến (`PORT`, `MONGODB_URI`, `JWT_SECRET`).

#### ⬜ Day 29 — Deploy Frontend
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:** Cấu hình Vercel, các file biến môi trường client.
- **Chi tiết thực hiện:**
  - Chạy build sản phẩm client (`npm run build`) để kiểm tra lỗi build.
  - Cấu hình chuyển hướng SPA (redirect rules) trong file `vercel.json` để React Router không bị lỗi 404 khi tải lại trang.
  - Deploy client lên Vercel, kết nối với tên miền API backend trực tuyến.

#### ⬜ Day 30 — Hoàn thiện Portfolio (Tài liệu hóa dự án)
- **Trạng thái:** ⬜ Chưa bắt đầu
- **Các file liên quan:** [README.md](file:///d:/personal/tech-store/README.md), [AGENTS.md](file:///d:/personal/tech-store/AGENTS.md)
- **Chi tiết thực hiện:**
  - Cập nhật file README hướng dẫn chạy dự án ở local bằng các câu lệnh đơn giản nhất.
  - Ghi tài liệu API ngắn gọn, tóm tắt các tính năng nổi bật và đường dẫn Live Demo.
  - Hoàn thiện portfolio cá nhân để sẵn sàng giới thiệu sản phẩm.
