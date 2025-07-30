// Sepet slice'ı - Redux ile sepet işlemlerini yönetir
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Sepeti backend'den çekmek için async thunk
export const fetchCartFromBackend = createAsyncThunk(
  'cart/fetchCartFromBackend',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token'); // Kullanıcı token'ı
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
        productId: item.product?.id || item.productId, // Ürün id
        name: item.product?.name || 'Ürün', // Ürün adı
        price: item.product?.price || 0, // Ürün fiyatı
        image: item.product?.imageUrl || '/images/default-product.jpg', // Ürün görseli
        quantity: item.quantity || 1, // Miktar
        stock: item.product?.stock ?? 99 // Stok
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
        state.status = 'loading'; // Yükleniyor
      })
      .addCase(fetchCartFromBackend.fulfilled, (state, action) => {
        state.status = 'succeeded'; // Yüklendi
        state.cartItems = action.payload;
      })
      .addCase(fetchCartFromBackend.rejected, (state, action) => {
        state.status = 'failed'; // Hata
        state.error = action.payload;
      });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Sepet toplam tutarını hesaplayan selector
export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

export default cartSlice.reducer; 