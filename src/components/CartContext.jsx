import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();
const API_BASE = "http://localhost:5220";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Sepete ürün ekleme fonksiyonu
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      const imageUrl = item.image ? (item.image.startsWith('http') ? item.image : API_BASE + item.image) : '/images/default-product.jpg';
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity, image: imageUrl }
            : i
        );
      }
      return [...prevItems, { ...item, image: imageUrl }];
    });
  };

  // Sepetten ürün çıkarma fonksiyonu
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Sepetteki ürün miktarını güncelleme fonksiyonu
  const updateQuantity = (id, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Sepeti temizleme fonksiyonu
  const clearCart = () => {
    setCartItems([]);
  };

  // Sepet toplam tutarını hesapla
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 0
  );

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

export const useCart = () => useContext(CartContext);
// Açıklama: Bu context sadece local sepet işlemleri için kullanılabilir. Kullanıcı ve backend işlemleri Redux ile yönetilmelidir.