# Tech Store - Design System (Design DNA)

Đây là tài liệu trích xuất cấu trúc thiết kế (Design DNA) của dự án Tech Store. Tài liệu này có thể được sử dụng với Stitch MCP (thông qua lệnh `create_design_system_from_design_md` hoặc `upload_design_md`) để áp dụng lên các giao diện khác.

## 1. Typography (Phông chữ)
- **Primary / Body Font:** `Inter`, ui-sans-serif, system-ui
- **Display / Heading Font:** `Space Grotesk`, sans-serif
- **Monospace Font:** `JetBrains Mono`, monospace
- **Đặc điểm:** Sử dụng font Inter cho nội dung đọc để mang lại sự rõ ràng, hiện đại; Space Grotesk cho các tiêu đề lớn tạo cá tính công nghệ; JetBrains Mono cho các đoạn mã hoặc số liệu kỹ thuật.

## 2. Color Palette (Bảng màu)
- **Nền tổng thể (Background):** `#F5F7FA` (Xám nhạt - Light Gray) giúp làm nổi bật các thẻ nội dung.
- **Nền Card / Container:** `#FFFFFF` (Trắng tinh) tạo sự tương phản mạnh mẽ với nền xám.
- **Màu thương hiệu (Primary):**
  - **Dark Navy / Hero Background:** `#1a365d` (Xanh đen viền sâu)
  - **Tech Blue:** `#2563eb` (Blue 600 - cho các nút bấm, link, icon nhấn)
- **Màu nhấn (Accent / Khuyến mãi):**
  - **Flash Sale Orange:** `#ff5722` (Cam đậm nổi bật sự kiện)
  - **Warning/Sale Text:** `#ff9800`, `#e64a19`
- **Gradients (Đổ màu):**
  - **Tech Gradient:** `linear-gradient(135deg, #00236f 0%, #0058be 100%)`

## 3. Shape & Border Radius (Bo góc)
- Thiết kế mang hơi hướng hiện đại, thân thiện và bo cong mềm mại:
  - **Cards / Containers:** Bo góc lớn `rounded-2xl` (16px) hoặc `rounded-xl` (12px).
  - **Buttons / Icons:** Bo góc tròn `rounded-full` (9999px) hoặc `rounded-lg` (8px) tùy vào độ lớn.

## 4. Spacing & Layout (Bố cục)
- **Container:** Rộng tối đa `max-w-7xl` (1280px) canh giữa (`mx-auto`) với padding hai bên `px-4`.
- **Khoảng cách (Gaps/Margins):** 
  - Margin giữa các Section: `mt-8` (32px).
  - Khoảng cách giữa các phần tử lưới (Grid/Flex): `gap-4` (16px), `gap-6` (24px).
- **Phân chia khối:** Các khối nội dung (Categories, Features, Products) được đặt gọn gàng trong các thẻ Card cách biệt thay vì dính liền.

## 5. Effects & Appearance (Hiệu ứng)
- **Shadows (Đổ bóng):** Sử dụng bóng đổ nhẹ (`shadow-sm`) cho trạng thái bình thường và (`shadow-md`) khi tương tác (`hover`).
- **Glassmorphism:** Sử dụng lớp nền bán trong suốt kết hợp làm mờ (`backdrop-filter: blur(12px)`) cho các nút điều hướng hoặc thẻ đặc biệt (`glass-card`).
- **Transitions:** Tất cả tương tác đều có hiệu ứng mượt mà (`transition-all`, `transition-transform duration-500`, `hover:scale-105`).
