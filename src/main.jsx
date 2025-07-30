// Uygulamanın giriş noktası - React uygulaması burada başlatılır
import React from 'react';
import ReactDOM from 'react-dom/client'; 
import { BrowserRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Global stiller
import './css/global-image-styles.css'; // Global resim stilleri
import App from './App.jsx';
// Açıklama: Bu dosyada UserProvider kaldırıldı. Kullanıcı işlemleri artık Redux Toolkit ile yönetiliyor.
import { Provider } from 'react-redux'; // Redux Provider'ı ekliyoruz
import store from './store'; // Oluşturduğumuz Redux store'u import ediyoruz

// React uygulamasını root elementine render et
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Tüm uygulamayı Redux ile sarmalıyoruz */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
