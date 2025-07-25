import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Sepeti backend'den çekmek için async thunk
export const fetchCartFromBackend = createAsyncThunk(
  'cart/fetchCartFromBackend',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7098/api/CartItem/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Sunucu hatası');
      const data = await response.json();
      // Backend'den gelen veriyi CartContext formatına çeviriyoruz
      return data.map(item => ({
        id: item.id, // cartItemId olarak ayarlandı
        productId: item.product?.id || item.productId,
        name: item.product?.name || 'Ürün',
        price: item.product?.price || 0,
        image: item.product?.imageUrl || '/images/default-product.jpg',
        quantity: item.quantity || 1,
        stock: item.product?.stock ?? 99
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [], // Sepetteki ürünler
    status: 'idle', // Yüklenme durumu
    error: null, // Hata mesajı
  },
  reducers: {
    addToCart: (state, action) => {
      // Sepete ürün ekleme işlemi
      const existingItem = state.cartItems.find(i => i.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cartItems.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      // Sepetten ürün çıkarma işlemi
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      // Sepetteki ürünün miktarını güncelleme
      const item = state.cartItems.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      // Sepeti tamamen temizleme
      state.cartItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartFromBackend.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCartFromBackend.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cartItems = action.payload;
      })
      .addCase(fetchCartFromBackend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Sepet toplam tutarını hesaplayan selector
export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

export default cartSlice.reducer; 