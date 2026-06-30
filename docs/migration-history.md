# Migration History (Lịch sử Chuyển đổi Kiến trúc)

Tài liệu này ghi nhận lại quá trình Migration quan trọng của dự án Tech Store, đặc biệt là đợt cấu trúc lại (Refactoring) lớn sang **Hybrid Feature Structure** vào cuối tháng 06/2026.

## Tổng quan Chiến dịch Migration

- **Mục tiêu:** Giải quyết nợ kỹ thuật (Technical Debt) do cấu trúc Monolithic phình to, chuyển sang mô hình Feature-based kết hợp (Hybrid Feature Structure).
- **Công cụ:** Sử dụng **`ts-morph`** để tự động hóa việc di chuyển file vật lý và cập nhật lại toàn bộ AST (Abstract Syntax Tree) của các đường dẫn `import` bị ảnh hưởng trên toàn dự án.
- **Tiến trình:** Phân tách nhỏ thành 5 phase để kiểm soát rủi ro. Sau mỗi phase đều build và lint nghiêm ngặt.

---

## Chi tiết các Phase Migration

### Phase 1: Admin Feature (Hoàn tất)
- **Tác vụ:** Chuyển toàn bộ các trang quản trị (`Dashboard`, `Products`, `Orders`, `Users`, `Brands`, `Categories`) từ `src/pages/` sang `src/features/admin/`.
- **Thành phần đi kèm:** Di chuyển `AdminTable` và các biểu đồ (`CategoryPieChart`, `RevenueChart`) từ `src/components/admin/` sang `src/features/admin/components/`.
- **Hooks:** Di dời `useDashboard.js` từ root `src/hooks/` vào `src/features/admin/hooks/` vì nó mang tính đóng gói đặc thù.
- **Xác nhận:** `Vite build` thành công, commit độc lập.

### Phase 2: Auth Feature (Hoàn tất)
- **Tác vụ:** Chuyển `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` sang `src/features/auth/`.
- **Ngoại lệ:** Cố ý giữ lại `AuthLayout` ở `src/components/layouts/` và `PasswordField` ở `src/components/common/` vì đây là các Core Infrastructure.
- **Xác nhận:** `Vite build` thành công, commit độc lập.

### Phase 3: Products Feature (Hoàn tất)
- **Tác vụ:** Chuyển `ProductDetail.jsx` và `CategoryPage.jsx` sang `src/features/products/`.
- **Thành phần đi kèm:** Đưa `ProductReviews` vào `src/features/products/components/`. Sửa lỗi đường dẫn import Component (`ProductSkeleton`) do xung đột phần mở rộng file `.tsx`.
- **Xác nhận:** `Vite build` thành công, commit độc lập.

### Phase 4: PC Builder Feature (Hoàn tất)
- **Tác vụ:** Chuyển `PCBuilder.jsx` sang `src/features/builder/`.
- **Tiện ích đi kèm:** Đưa file utility `compatibility.js` (chỉ dùng cho logic check tương thích linh kiện) từ `src/utils/` sang `src/features/builder/utils/`.
- **Xác nhận:** `Vite build` thành công, commit độc lập.

### Phase 5: Profile Feature (Hoàn tất)
- **Tác vụ:** Chuyển `Profile.jsx` sang `src/features/profile/`.
- **Thành phần đi kèm:** Đưa `ProfileCart.jsx` và `ProfileOrders.jsx` vào `src/features/profile/components/`.
- **Xác nhận:** `Vite build` thành công, commit độc lập, dọn dẹp sạch sẽ các script `ts-morph` tạm thời.

---

## Bài học và Kinh nghiệm (Takeaways)

1. **Công cụ tự động hóa:** Áp dụng `ts-morph` là quyết định sống còn giúp tiết kiệm thời gian sửa thủ công hàng trăm đường dẫn `import` tương đối (`../../...`), đồng thời ngăn chặn lỗi "Missing Modules".
2. **Cách tiếp cận "Baby Steps":** Chia quá trình refactor thành 5 phase nhỏ lẻ kèm theo cơ chế "kiểm duyệt gắt gao" (Lint + Build) giúp hệ thống không rơi vào trạng thái "vỡ tung" không thể rollback.
3. **Giới hạn của Refactoring:** Việc biết khi nào nên dừng lại (Dừng ở Hybrid thay vì 100% Feature-based) giúp tránh việc "Refactor vì Refactor" mà không mang lại giá trị thực tế, đồng thời bảo toàn được tính ổn định cốt lõi của React components.
