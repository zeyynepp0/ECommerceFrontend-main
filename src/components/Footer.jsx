import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
//import "../../css/Footer.css";
import "../css/Footer.css";


const Footer = ({ darkMode }) => {
  return (
    <footer className={`footer ${darkMode ? 'dark' : ''}`}>
      <div className="footer-container">
        
        <div className="footer-logo">
          <span className="logo-text">SHOP</span>
          <span className="logo-highlight">{darkMode ? 'DARK' : 'LIGHT'}</span>
        </div>

        <div className="footer-links">
          <div className="link-column">
            <h4>Hızlı Linkler</h4>
            <a href="/">Anasayfa</a>
            <a href="/products">Ürünler</a>
            <a href="/about">Hakkımızda</a>
            <a href="/contact">İletişim</a>
          </div>

          <div className="link-column">
            <h4>Hesap</h4>
            <a href="/login">Giriş Yap</a>
            <a href="/register">Kayıt Ol</a>
            <a href="/cart">Sepetim</a>
            <a href="/wishlist">Favoriler</a>
          </div>

          <div className="link-column">
            <h4>Yardım</h4>
            <a href="/faq">SSS</a>
            <a href="/shipping">Kargo & Teslimat</a>
            <a href="/returns">İade Politikası</a>
            <a href="/privacy">Gizlilik Politikası</a>
          </div>
        </div>

        <div className="footer-social">
          <h4>Bizi Takip Edin</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Shop{darkMode ? 'Dark' : 'Light'}. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
};

export default Footer;