# Decision Log (Nhật ký Quyết định Kiến trúc)

Tài liệu này ghi nhận lại các quyết định thiết kế và kiến trúc quan trọng được đưa ra trong quá trình phát triển và refactor dự án.

## Quyết định 1: Lựa chọn "Hybrid Feature Structure" thay vì "Feature-based hoàn toàn"
- **Thời gian quyết định:** Tháng 06/2026
- **Ngữ cảnh:** Dự án phát triển nhanh chóng với nhiều tính năng mới (Admin, Products, Profile, Auth, Builder) khiến cấu trúc Monolithic cũ (`pages/`, `components/`) trở nên quá tải và khó bảo trì. Tuy nhiên, việc chuyển đổi 100% sang Feature-based (tức là chuyển cả Core Infrastructure vào `features/`) sẽ tốn kém chi phí refactor quá lớn và không thực sự mang lại lợi ích tương xứng.
- **Quyết định:** Áp dụng mô hình **Hybrid**. Chỉ gom nhóm (encapsulate) các domain nghiệp vụ lớn thành feature (`features/admin`, `features/auth`), trong khi vẫn giữ nguyên Core Infrastructure (như `components/common`, `hooks`, `layouts`) ở cấp độ root.
- **Kết quả (Outcome):** Đã hoàn tất di chuyển qua 5 phase (Admin, Auth, Products, Builder, Profile) bằng công cụ `ts-morph` an toàn mà không phá vỡ logic chung, tạo tiền đề kiến trúc cho 6 tháng phát triển tới.

## Quyết định 2: Điều chỉnh Naming Convention cho Utility Functions và Classes
- **Thời gian quyết định:** Tháng 06/2026
- **Ngữ cảnh:** Khi rà soát lại Naming Convention toàn dự án, phát hiện file `server/utils/ApiError.js` viết hoa chữ cái đầu (PascalCase), vi phạm rule ban đầu là `Utilities: camelCase`.
- **Quyết định:** Quyết định **không đổi tên** `ApiError.js` thành `apiError.js`. Thay vào đó, thay đổi luật Naming Convention để phản ánh đúng bản chất: Các module xuất ra một `class` (như Error, Service, Repository) phải dùng `PascalCase`, còn các Utility Function thông thường mới dùng `camelCase`. 
- **Kết quả (Outcome):** Quy tắc này giúp code tự nhiên hơn, bám sát các standard của cộng đồng Node.js và TypeScript (`import ApiError from '../utils/ApiError'`), đảm bảo không có code smell khi import. Dự án đạt chuẩn 100% naming convention.

## Quyết định 3: Tách Admin Panel thành Feature độc lập
- **Thời gian quyết định:** Tháng 06/2026
- **Ngữ cảnh:** Dashboard của Admin có rất nhiều Page và Component liên quan chặt chẽ với nhau (Dashboard, Brands, Categories, AdminTable).
- **Quyết định:** Gom toàn bộ vào `features/admin/`. Đưa hook `useDashboard.js` từ global hooks vào `features/admin/hooks/` vì nó chỉ phục vụ cho duy nhất domain admin. Cấu trúc lại `AdminTable` sử dụng composition để khử lặp code render bảng trên 5 trang quản trị.
- **Kết quả (Outcome):** Tính đóng gói (Self-contained) của module Admin tăng đáng kể. Code dễ dàng maintain hoặc thậm chí tách riêng thành một dự án Admin Portal riêng biệt trong tương lai.
