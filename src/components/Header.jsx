import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  FiSearch, 
  FiShoppingCart, 
  FiHeart, 
  FiUser, 
  FiSun, 
  FiMoon, 
  FiMenu, 
  FiX,
  FiChevronDown,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiHome,
  FiStar,
  FiPercent,
  FiInfo,
  FiMail,
  FiBell
} from 'react-icons/fi';
import { AiOutlineProduct } from "react-icons/ai";
import '../css/Header.css';
import Modal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { fetchCartFromBackend, clearCart } from '../store/cartSlice'; // Sepet işlemleri
import { fetchFavorites, clearFavorites, selectFavoritesCount } from '../store/favoriteSlice'; // Favori işlemleri
import { logout } from '../store/userSlice'; // Kullanıcı çıkışı için action import edildi
import axios from 'axios';

Modal.setAppElement('#root');

const Header = ({ darkMode, setDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();
  // Sepet verilerini Redux store'dan alıyoruz
  const { cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  // Kullanıcı bilgilerini Redux store'dan alıyoruz
  const { isLoggedIn, userId } = useSelector(state => state.user);
  // Favori verilerini Redux store'dan alıyoruz
  const favoritesCount = useSelector(selectFavoritesCount);
  const isAdmin = localStorage.getItem('role') === 'Admin';
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setShowDropdown(false);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  // Çıkış işlemi
  const handleLogout = () => {
    dispatch(logout()); // Kullanıcıyı Redux'tan çıkış yaptır
    dispatch(clearCart()); // Sepeti temizle
    dispatch(clearFavorites()); // Favorileri temizle
    setShowDropdown(false); // Dropdown menüyü kapat
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sayfa değiştiğinde header'ı güncelle
  useEffect(() => {
    if (isLoggedIn && userId) {
      dispatch(fetchCartFromBackend(userId)); // Redux ile sepeti güncelle
      dispatch(fetchFavorites()); // Redux ile favorileri güncelle
    }
  }, [isLoggedIn, userId, dispatch]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchUnreadCount();
    }
  }, [isLoggedIn, userId]);

  const fetchUnreadCount = async () => {
    try {
      const count = await fetch(`http://localhost:5220/api/Notification/unread-count/${userId}`).then(r => r.json());
      setNotificationCount(count);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const notifs = await fetch(`http://localhost:5220/api/Notification/user/${userId}`).then(r => r.json());
      setNotifications(notifs);
    } catch {}
  };

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const handleMarkAllAsRead = async () => {
    await fetch(`http://localhost:5220/api/Notification/mark-all-as-read/${userId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    await fetchNotifications();
    await fetchUnreadCount();
  };

  // Manuel yenileme fonksiyonu
  const refreshHeader = () => {
    if (isLoggedIn && userId) {
      dispatch(fetchCartFromBackend(userId)); // Redux ile sepeti güncelle
      dispatch(fetchFavorites()); // Redux ile favorileri güncelle
    }
  };

  // Arama işlemi
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Enter tuşu ile arama
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className={`header ${darkMode ? 'dark' : ''} ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-top">
        <div className="container">
          <div className="header-left">
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <Link to="/" className="logo" onClick={refreshHeader}>
              {darkMode ? (
                <span className="logo-text">SHOP<span className="logo-highlight">DARK</span></span>
              ) : (
                <span className="logo-text">SHOP<span className="logo-highlight">LIGHT</span></span>
              )}
            </Link>
          </div>

          <div className="header-center">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="search-button"
                onClick={handleSearch}
              >
                <FiSearch size={18} />
              </button>
            </div>
          </div>

          <div className="header-right">
            {/* Admin Paneli butonu: Sadece admin giriş yaptıysa görünür */}
            {isAdmin && (
              <Link to="/admin" className="admin-panel-btn">
                Admin Paneli
              </Link>
            )}
            <div className="profile-section">
              <button 
                className="profile-button"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                aria-label="Profil menüsü"
              >
                <div className="profile-avatar">
                  <FiUser size={16} />
                </div>
                <span className="profile-name">{isLoggedIn ? 'Hesabım' : 'Giriş Yap'}</span>
                <FiChevronDown size={14} className={`dropdown-icon ${showDropdown ? 'open' : ''}`} />
              </button>

              {showDropdown && (
                <div className="profile-dropdown">
                 
                      {!isLoggedIn ? (
  <>
    <Link 
      to="/login" 
      className="dropdown-item"
      onClick={() => setShowDropdown(false)} // Dropdown'ı kapat
    >
      <FiLogIn size={16} />
      <span>Giriş Yap</span>
    </Link>
    <Link 
      to="/register"  // /signup yerine /register kullanımı daha yaygın
      className="dropdown-item"
      onClick={() => setShowDropdown(false)} // Dropdown'ı kapat
    >
      <FiUserPlus size={16} />
      <span>Kayıt Ol</span>
    </Link>
  </>
) : (
                    <>
                      <Link to={`/profile/${userId}`} className="dropdown-item">
                        <FiUser size={16} />
                        <span>Profilim</span>
                      </Link>
                      <Link to={`/profile/${userId}?tab=orders`} className="dropdown-item">
                      <FiShoppingCart size={16} />
                      <span>Siparişlerim</span>
                      </Link>
                      <Link to={`/profile/${userId}?tab=favorites`} className="dropdown-item">
                        <FiHeart size={16} />
                        
                        <span>Favorilerim</span>
                      </Link>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                      >
                        <FiLogOut size={16} />
                        <span>Çıkış Yap</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <Link to={`/profile/${userId}?tab=favorites`} className="header-icon" aria-label="Favoriler" onClick={refreshHeader}>
              <FiHeart size={20} />
              <span className="icon-label">Favoriler</span>
              <span className="icon-badge">{favoritesCount}</span>
            </Link>
            
            <Link to="/cart" className="header-icon cart" aria-label="Sepet" onClick={refreshHeader}>
              <FiShoppingCart size={20} />
              <span className="icon-label">Sepet</span>
              <span className="icon-badge">{cartItems.length}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="header-bottom">
        <div className="container">
          <nav className="main-nav">
            <ul className="nav-list">
              {/* Admin Paneli menüde de gösterilebilir */}
              {isAdmin && (
                <li className="nav-item">
                  <Link to="/admin" className="nav-link">
                    <FiUser size={16} />
                    Admin Paneli
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={refreshHeader}>
                  <FiHome size={16} />
                  Ana Sayfa
                </Link>
              </li>
              

              
              <li className="nav-item">
                <Link to="/products" className="nav-link" onClick={refreshHeader}>
                  <AiOutlineProduct size={16} />
                  Tüm Ürünler
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/products?discount=true" className="nav-link" onClick={refreshHeader}>
                  <FiPercent size={16} />
                  İndirimler
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/about" className="nav-link" onClick={refreshHeader}>
                  <FiInfo size={16} />
                  Hakkımızda
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/contact" className="nav-link" onClick={refreshHeader}>
                  <FiMail size={16} />
                  İletişim
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Auth Modal */}
      <Modal
        isOpen={showAuthModal}
        onRequestClose={closeAuthModal}
        className="auth-modal"
        overlayClassName="auth-modal-overlay"
      >
        
      </Modal>
      {/* Bildirim ikonu */}
      {isLoggedIn && (
        <div className="header-icon notification" style={{ position: 'relative', marginRight: 8 }}>
          <button onClick={handleNotificationClick} style={{ background: 'none', border: 'none', position: 'relative' }} aria-label="Bildirimler">
            <FiBell size={20} />
            {notificationCount > 0 && <span className="icon-badge" style={{ position: 'absolute', top: -6, right: -6, background: 'red', color: 'white', borderRadius: '50%', fontSize: 12, padding: '2px 6px' }}>{notificationCount}</span>}
          </button>
          {showNotifications && (
            <div className="notification-dropdown" style={{ position: 'absolute', right: 0, top: 32, zIndex: 1000, background: '#fff', border: '1px solid #eee', borderRadius: 8, minWidth: 320, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                <span className="fw-bold">Bildirimler</span>
                <button className="btn btn-link btn-sm" onClick={handleMarkAllAsRead}>Tümünü Okundu Yap</button>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted">Bildirim yok.</div>
                ) : notifications.map(n => (
                  <div key={n.id} className={`p-2 border-bottom ${n.isRead ? '' : 'bg-light'}`}>{n.message}<br /><small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;