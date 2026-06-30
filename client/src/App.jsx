import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import CategoryPage from "./pages/CategoryPage";
import PCBuilder from "./pages/PCBuilder";
import NotFound from "./pages/NotFound";

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
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/search" element={<CategoryPage />} />
        <Route path="/collections/all" element={<Navigate to="/" replace />} />
        <Route path="/collections/:slug" element={<CategoryPage />} />
        <Route path="/products/:slug" element={<Home><ProductDetail /></Home>} />
        <Route path="/profile" element={<Home><Profile /></Home>} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/xay-dung-cau-hinh" element={<Home><PCBuilder /></Home>} />
        
        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />

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
