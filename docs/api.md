# API Documentation

The backend exposes a RESTful API returning JSON responses.

## Standard Response Format
All API responses follow a predictable structure:

**Success Response:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description here",
  "stack": "..." // Only in development mode
}
```

## Core Endpoints
### Authentication (`/api/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Authenticate user and receive JWT.
- `GET /me`: Get current authenticated user profile.

### Products (`/api/products`)
- `GET /`: List products (supports pagination, filtering by category, brand, price).
- `GET /:slug`: Get product details.
- `GET /builder`: Specialized endpoint for retrieving PC components by compatibility.

### Orders (`/api/orders`)
- `POST /`: Create a new order.
- `GET /`: Retrieve user orders.
- `PATCH /:id/cancel`: Cancel a specific order (requires authentication).

### Admin (`/api/admin`)
- Various endpoints for CRUD operations on products, users, categories, and brands. Requires Admin JWT role.

## Error Handling
The backend uses a centralized error middleware. Common HTTP status codes:
- `400 Bad Request`: Validation errors.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated, but insufficient permissions (e.g., not an admin).
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unhandled backend exception.
