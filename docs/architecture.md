# Kiến trúc Dự án (Architecture)

Dự án Tech Store sử dụng **Hybrid Feature Structure** (Cấu trúc lai), kết hợp giữa việc đóng gói theo tính năng (Feature-based) đối với các nghiệp vụ lớn và kiến trúc theo tầng (Layer-based) đối với phần dùng chung (Core Infrastructure).

## 1. Project Structure

Cấu trúc tổng quan của hệ thống Frontend:

```text
src/
├── assets/                 # Hình ảnh, fonts, global CSS
├── components/
│   ├── common/             # Các component dùng chung (Button, Input, Modal, v.v.)
│   └── layouts/            # Các layout bao ngoài (UserLayout, AdminLayout, AuthLayout)
├── contexts/               # React Context providers (AuthContext, CartContext, v.v.)
├── hooks/                  # Các Custom Hooks dùng chung toàn dự án
├── router/                 # Cấu hình React Router
├── services/               # Cấu hình Axios, API client
├── utils/                  # Các hàm tiện ích dùng chung
├── pages/                  # Các trang đơn giản, chung chung (Home, NotFound)
└── features/               # Đóng gói các Domain nghiệp vụ đủ lớn
    ├── admin/
    ├── auth/
    ├── builder/
    ├── products/
    └── profile/
```

## 2. Feature Rules

- **Chỉ tạo Feature khi đủ lớn**: Không tạo thư mục feature rỗng hoặc chỉ có 1 file. Các module nhỏ (ví dụ: Cart, Payment, Reviews) sẽ tạm thời nằm ở `pages/` hoặc `components/` cho đến khi chúng đủ lớn để tách thành feature riêng.
- **Tính đóng gói (Self-contained)**: Nếu một Hook, Component hoặc Util **chỉ được sử dụng duy nhất** cho một feature, nó BẮT BUỘC phải nằm bên trong thư mục của feature đó (ví dụ: `features/admin/hooks/useDashboard.js` hoặc `features/builder/utils/compatibility.js`).
- **Hạn chế nesting**: Các component Page của feature nên được đặt ngay ở root của thư mục feature (ví dụ: `features/admin/Dashboard.jsx`) thay vì tạo thêm thư mục `pages/` lồng nhau không cần thiết.
- **Không chứa shared logic**: Tuyệt đối không để các component/hook dùng chung nằm bên trong một thư mục feature cụ thể.

## 3. Shared Rules

- **Core Infrastructure là bất khả xâm phạm**: Bất kỳ thứ gì được sử dụng ở 2 feature trở lên phải được đẩy ra ngoài root (`src/hooks/`, `src/utils/`, `src/components/common/`).
- **Tránh trùng lặp**: Trước khi viết một tiện ích hoặc hook ở global, cần kiểm tra kỹ xem đã có logic tương tự chưa (ví dụ: tận dụng `usePagination`, `useSearch`).
- **Độc lập tính năng**: Core không được phép phụ thuộc ngược lại vào các `features/`.

## 4. Naming Convention

- **Thư mục (Folders)**: Sử dụng `lowercase` (hoặc `kebab-case` nếu có nhiều từ). Ví dụ: `features/`, `admin/`, `common/`.
- **Components & Pages**: Sử dụng `PascalCase`. Ví dụ: `ProductCard.jsx`, `AdminTable.jsx`.
- **Hooks**: Sử dụng `camelCase`, luôn bắt đầu bằng chữ `use`. Ví dụ: `useFetchData.js`, `useDashboard.js`.
- **Utils, Services & Constants**: Sử dụng `camelCase` hoặc `UPPER_SNAKE_CASE` đối với hằng số. Ví dụ: `api.js`, `compatibility.js`, `PRICE_RANGES`.

## 5. Hook Rules

- **Single Responsibility Principle (SRP)**: Mỗi hook chỉ nên làm đúng MỘT việc. Không viết các "God hook" (ví dụ: `useAdminCrud` làm mọi thứ từ fetch, delete, tạo modal state...).
- **Composition over Abstraction**: Ưu tiên sử dụng **Composition Hooks** thay vì Abstraction quá đà. 
  - Ví dụ Tốt: `useTableData` đóng vai trò kết hợp các hook nhỏ hơn (`useSearch`, `useSorting`, `usePagination`). Bằng cách này, các page đơn giản có thể dùng chung `useTableData`, trong khi các page phức tạp có thể gọi lẻ từng hook nhỏ theo nhu cầu.
- **YAGNI (You Aren't Gonna Need It)**: Đừng vội tạo một custom hook dùng chung nếu logic đó mới chỉ được dùng ở đúng một component.

## 6. Component Rules

- **Shared Components (Dumb Components)**:
  - Nằm trong `src/components/common/`.
  - Hạn chế tối đa việc gọi Context hoặc API bên trong.
  - Phụ thuộc hoàn toàn vào `props` truyền từ ngoài vào.
- **Feature Components (Smart Components)**:
  - Được phép kết nối trực tiếp với Context, API Services và Redux/Zustand nếu thuộc về feature domain đó.
- **Khử mã lặp (DRY - Don't Repeat Yourself)**:
  - Nếu thấy UI giống nhau (như thẻ `AuthCard`, `AuthForm`), tiến hành gom nhóm thành các Sub-component.
  - Sử dụng chung một Component thư viện (ví dụ: `AdminTable` với các columns configuration truyền qua props) thay vì copy-paste table HTML ra nhiều trang khác nhau.
