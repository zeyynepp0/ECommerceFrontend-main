import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import favoriteReducer from './favoriteSlice';
import userReducer from './userSlice';

// Redux store'u oluşturuyoruz. Tüm slice'ları burada birleştiriyoruz.
const store = configureStore({
  reducer: {
    cart: cartReducer, // Sepet işlemleri
    favorite: favoriteReducer, // Favori işlemleri
    user: userReducer, // Kullanıcı işlemleri
  },
});

export default store; 