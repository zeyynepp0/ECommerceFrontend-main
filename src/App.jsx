import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
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
  const [darkMode, setDarkMode] = useState(false);
  // Açıklama: Bu dosyada UserContext ve UserProvider kaldırıldı. Kullanıcı işlemleri artık Redux Toolkit ile yönetiliyor.

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public routes CoreUILayout ile sarmalanıyor */}
          <Route element={<CoreUILayout darkMode={darkMode} setDarkMode={setDarkMode} />}>
            <Route path="/" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />} /> 
            <Route path="/products" element={<ProductsPage darkMode={darkMode} />} />
            <Route path="/products/:id" element={<ProductDetailsPage darkMode={darkMode} />} />
            <Route path="/cart" element={<CartPage darkMode={darkMode} />} />
            <Route path="/checkout" element={<CheckoutPage darkMode={darkMode} />} />
            <Route path="/profile/:userId" element={<ProfilePage darkMode={darkMode} />} />
            <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
            <Route path="/register" element={<RegisterPage darkMode={darkMode} />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
          {/* Admin paneli için nested route */}
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;