import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ForgotPassword from "./pages/ForgotPassword";

// We keep these routes for fallback/reference, but the new UI
// merges ProductList and Cart into the StoreDashboard (Home).
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";

// Admin Imports
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminBrands from "./pages/admin/Brands";
import AdminUsers from "./pages/admin/Users";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public / Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:slug" element={<ProductDetail />} />

        {/* Admin Routes Protected by AdminRoute & AdminLayout */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
