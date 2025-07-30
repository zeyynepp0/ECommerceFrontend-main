// Favori ürünler context'i - Kullanıcı favori işlemlerini yönetir
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  // Favori ürünler state'i
  const [favorites, setFavorites] = useState([]);
  // Kullanıcı ve token bilgisi
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const API_BASE = "https://localhost:7098";

  // Favori ürünleri backend'den çek
  const fetchFavorites = async () => {
    if (!userId || !token) return;
    try {
      const res = await axios.get(`https://localhost:7098/api/Favorite/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data.map(fav => ({
        ...fav,
        imageUrl: fav.imageUrl ? (fav.imageUrl.startsWith('http') ? fav.imageUrl : API_BASE + fav.imageUrl) : '/images/default-product.jpg'
      })));
    } catch (err) {
      // Favoriler çekilemezse konsola yaz
      console.error("Failed to fetch favorites:", err);
    }
  };

  // Favoriye ürün ekle
  const addFavorite = async (productId) => {
    if (!userId || !token) return;
    try {
      const payload = {
        UserId: parseInt(userId),
        ProductId: parseInt(productId)
      };
      await axios.post('https://localhost:7098/api/Favorite/add', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Favorileri yeniden çek
      await fetchFavorites();
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw error;
    }
  };

  // Favoriden ürün çıkar
  const removeFavorite = async (productId) => {
    if (!userId || !token) return;
    try {
      const payload = {
        UserId: parseInt(userId),
        ProductId: parseInt(productId)
      };
      await axios.delete('https://localhost:7098/api/Favorite/remove', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      // Favorileri yeniden çek
      await fetchFavorites();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      throw error;
    }
  };

  // Favori durumunu değiştir (ekle/çıkar)
  const toggleFavorite = async (productId) => {
    const isFavorited = favorites.some(fav => fav.productId === productId);
    if (isFavorited) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  };

  // Tüm favorileri temizle (local)
  const clearFavorites = () => {
    setFavorites([]);
  };

  // İlk yüklemede ve kullanıcı/token değiştiğinde favorileri çek
  useEffect(() => {
    fetchFavorites();
  }, [userId, token]);

  // Otomatik yenileme - her 5 saniyede bir favorileri güncelle
  useEffect(() => {
    if (!userId || !token) return;
    const interval = setInterval(() => {
      fetchFavorites();
    }, 5000); // 5 saniye
    return () => clearInterval(interval);
  }, [userId, token]);

  // Sağlanan context değerleri
  return (
    <FavoriteContext.Provider value={{ 
      favorites, 
      fetchFavorites, 
      addFavorite, 
      removeFavorite, 
      toggleFavorite,
      favoritesCount: favorites.length,
      clearFavorites
    }}>
      {children}
    </FavoriteContext.Provider>
  );
};

// Favori context'ini kullanmak için hook
export const useFavorites = () => useContext(FavoriteContext);
