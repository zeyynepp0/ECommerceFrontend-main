import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Favorileri backend'den çekmek için async thunk
export const fetchFavorites = createAsyncThunk(
  'favorite/fetchFavorites',
  async (_, { rejectWithValue }) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) return [];
    try {
      const res = await axios.get(`http://localhost:5220/api/Favorite/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Favori ekleme işlemi
export const addFavorite = createAsyncThunk(
  'favorite/addFavorite',
  async (productId, { dispatch, rejectWithValue }) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) return;
    try {
      const payload = {
        UserId: parseInt(userId),
        ProductId: parseInt(productId)
      };
      await axios.post('http://localhost:5220/api/Favorite/add', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Favorileri güncelle
      dispatch(fetchFavorites());
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Favori silme işlemi
export const removeFavorite = createAsyncThunk(
  'favorite/removeFavorite',
  async (productId, { dispatch, rejectWithValue }) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) return;
    try {
      const payload = {
        UserId: parseInt(userId),
        ProductId: parseInt(productId)
      };
      await axios.delete('http://localhost:5220/api/Favorite/remove', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      // Favorileri güncelle
      dispatch(fetchFavorites());
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState: {
    favorites: [], // Favori ürünler
    status: 'idle', // Yüklenme durumu
    error: null, // Hata mesajı
  },
  reducers: {
    clearFavorites: (state) => {
      // Favorileri temizle
      state.favorites = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearFavorites } = favoriteSlice.actions;

// Favori sayısını döndüren selector
export const selectFavoritesCount = (state) => state.favorite.favorites.length;

export default favoriteSlice.reducer; 