import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
// import Header from './components/Header';
import HomePage from './page/HomePage';
import LoginPage from './page/LoginPage';
import RegisterPage from './page/RegisterPage';
// import Footer from './components/Footer';
import ProductsPage from './page/ProductsPage';
import ProductDetailsPage from './page/ProductDetailsPage'; 
import { CartProvider } from './components/CartContext';
import './App.css';
import axios from 'axios';
import CartPage from './page/CartPage';
import CheckoutPage from './page/CheckoutPage';
import ProfilePage from './page/ProfilePage';
import AdminRoutes from './admin/routes/AdminRoutes';
import CoreUILayout from './components/CoreUILayout';
import { useDispatch } from 'react-redux';
import CategoriesPage from './page/CategoriesPage';

const API = axios.create({
  baseURL: 'https://your-api-endpoint.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

function App() {
  // darkMode ve setDarkMode state'ini ve darkMode ile ilgili tüm kodları kaldır

  return (
    <div className="default-theme">
      <CartProvider>
        <Router>
          <Routes>
            {/* Public routes CoreUILayout ile sarmalanıyor */}
            <Route element={<CoreUILayout />}>
              <Route path="/" element={<HomePage />} /> 
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
            </Route>
            {/* Admin paneli için nested route */}
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </Router>
      </CartProvider>
    </div>
  );
}

export default App;