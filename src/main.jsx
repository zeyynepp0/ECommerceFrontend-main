import React from 'react';
import ReactDOM from 'react-dom/client'; 
import { BrowserRouter } from 'react-router-dom';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Açıklama: Bu dosyada UserProvider kaldırıldı. Kullanıcı işlemleri artık Redux Toolkit ile yönetiliyor.
import { Provider } from 'react-redux'; // Redux Provider'ı ekliyoruz
import store from './store'; // Oluşturduğumuz Redux store'u import ediyoruz

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}> {/* Tüm uygulamayı Redux ile sarmalıyoruz */}
      <App />
    </Provider>
  </React.StrictMode>
)
