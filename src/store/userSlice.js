// Kullanıcı slice'ı - Redux ile kullanıcı oturumunu yönetir
import { createSlice } from '@reduxjs/toolkit';

// Başlangıç state'i - localStorage'dan kullanıcı bilgilerini alır
const initialState = {
  userId: localStorage.getItem('userId') || null, // Kullanıcı ID
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true', // Giriş durumu
  token: localStorage.getItem('token') || '', // JWT token
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      // Kullanıcı giriş işlemi
      state.userId = action.payload.userId;
      state.isLoggedIn = true;
      state.token = action.payload.token;
      localStorage.setItem('userId', action.payload.userId);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      // Kullanıcı çıkış işlemi
      state.userId = null;
      state.isLoggedIn = false;
      state.token = '';
      localStorage.clear();
    },
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer; 