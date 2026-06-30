# Project Structure

The project is split into two primary workspaces: `client/` and `server/`.

## Client Structure (Hybrid Feature Structure)
We use a **Hybrid Feature Structure**. This keeps core, reusable infrastructural code at the root level, and encapsulates domain-specific logic into distinct feature modules.

```text
client/src/
├── assets/         # Static assets (images, fonts, global CSS)
├── components/     # Globally shared components
│   ├── common/     # UI primitives (Btn, Input, Modal, Table, etc.)
│   └── layouts/    # Structural layouts (UserLayout, AdminLayout, AuthLayout)
├── contexts/       # Global React Contexts (AuthContext, CartContext, AlertContext)
├── features/       # Domain-specific feature modules
│   ├── admin/      # Dashboard, User/Product management for Admin
│   ├── auth/       # Login, Register, Password Recovery
│   ├── builder/    # Custom PC Builder logic and UI
│   ├── products/   # Product listing (CategoryPage), Product details, Reviews
│   └── profile/    # User profile, Order history, Profile Cart
├── hooks/          # Global custom hooks (useAsync, useFetchData, usePagination, etc.)
├── pages/          # Top-level standalone pages (Home, NotFound, Checkout)
├── router/         # Application routing configuration
├── services/       # External service integrations (API client)
└── utils/          # Pure helper functions (formatDate, currency formatting)
```

## Server Structure
```text
server/
├── config/         # Environment variables and configuration files
├── controllers/    # Request handlers bridging routes to business logic
├── middlewares/    # Express middlewares (auth, error handling, validation)
├── models/         # Mongoose schemas and models
├── routes/         # API route definitions
└── utils/          # Backend utilities (ApiError, catchAsync, hashing)
```
