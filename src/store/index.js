// Redux store'unu oluşturur ve slice'ları birleştirir
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice'; // Sepet işlemleri reducer'ı
import favoriteReducer from './favoriteSlice'; // Favori işlemleri reducer'ı
import userReducer from './userSlice'; // Kullanıcı işlemleri reducer'ı

// Redux store'u oluşturuyoruz. Tüm slice'ları burada birleştiriyoruz.
const store = configureStore({
  reducer: {
    cart: cartReducer, // Sepet işlemleri
    favorite: favoriteReducer, // Favori işlemleri
    user: userReducer, // Kullanıcı işlemleri
  },
});

export default store; 