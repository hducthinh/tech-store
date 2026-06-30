import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";

import ForgotPassword from "./features/auth/ForgotPassword";
import ResetPassword from "./features/auth/ResetPassword";

import ProductDetail from "./features/products/ProductDetail";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import CategoryPage from "./features/products/CategoryPage";
import PCBuilder from "./pages/PCBuilder";
import NotFound from "./pages/NotFound";

// Admin Imports
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./features/admin/Dashboard";
import AdminOrders from "./features/admin/Orders";
import AdminProducts from "./features/admin/Products";
import AdminCategories from "./features/admin/Categories";
import AdminBrands from "./features/admin/Brands";
import AdminUsers from "./features/admin/Users";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
