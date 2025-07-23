import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();
const API_BASE = "http://localhost:5220";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Add product to cart function
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

  // Remove product from cart function
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Update quantity of product in cart function
  const updateQuantity = (id, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart function
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total cart amount
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
// Note: This context is only for local cart operations. User and backend operations should be managed with Redux.