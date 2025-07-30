// Sepet context'i - Uygulama genelinde sepet işlemlerini yönetir
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();
const API_BASE = "https://localhost:7098";

// Sepet sağlayıcı bileşeni
export const CartProvider = ({ children }) => {
  // Sepetteki ürünleri tutan state
  const [cartItems, setCartItems] = useState([]);

  // Sepete ürün ekle
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      // Ürün görseli url'sini hazırla
      const imageUrl = item.image ? (item.image.startsWith('http') ? item.image : API_BASE + item.image) : '/images/default-product.jpg';
      if (existingItem) {
        // Ürün zaten sepetteyse miktarını artır
        return prevItems.map(i =>
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity, image: imageUrl }
            : i
        );
      }
      // Yeni ürünü sepete ekle
      return [...prevItems, { ...item, image: imageUrl }];
    });
  };

  // Sepetten ürün çıkar
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Sepetteki ürünün miktarını güncelle
  const updateQuantity = (id, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Sepeti tamamen temizle
  const clearCart = () => {
    setCartItems([]);
  };

  // Sepetin toplam tutarını hesapla
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 0
  );

  // Sağlanan context değerleri
  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Sepet context'ini kullanmak için hook
export const useCart = () => useContext(CartContext);
// Not: Bu context sadece local sepet işlemleri içindir. Kullanıcı ve backend işlemleri Redux ile yönetilmelidir.