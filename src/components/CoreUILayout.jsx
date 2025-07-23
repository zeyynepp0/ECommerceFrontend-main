import React, { useState, useEffect } from 'react';
import {
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CFooter,
  CContainer,
  CNavItem,
  CNavLink,
  CButton,
  CAvatar,
  CBadge,
  CForm,
  CFormInput,
  CInputGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import { FiMenu, FiUser, FiShoppingCart, FiHeart, FiGift, FiLogIn, FiLogOut, FiUserPlus, FiSearch, FiSun, FiMoon, FiBell } from 'react-icons/fi';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../store/userSlice';
import { selectFavoritesCount } from '../store/favoriteSlice';
import { selectCartTotal } from '../store/cartSlice';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown } from 'react-bootstrap';
import './CoreUILayout.css'; // Özel stiller için
import { apiGet } from '../utils/api';

const CoreUILayout = ({ darkMode, setDarkMode }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Redux ve localStorage'dan login/rol bilgisi oku
  const reduxUser = useSelector(state => state.user);
  const userId = localStorage.getItem('userId');
  const isLoggedIn = !!userId && userId !== 'null' && userId !== 'undefined';
  const role = localStorage.getItem('role');
  const favoritesCount = useSelector(selectFavoritesCount);
  const cartTotal = useSelector(selectCartTotal);
  const cartItems = useSelector(state => state.cart.cartItems);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiGet('http://localhost:5220/api/Category');
        setCategories(cats);
      } catch {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId && userId !== 'null' && userId !== 'undefined') {
      fetchUnreadCount();
    }
  }, [isLoggedIn, userId]);

  const fetchUnreadCount = async () => {
    if (!userId) return;
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

  // Sidebar genişliği
  const sidebarWidth = sidebarVisible ? 200 : 56;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Aktif kategori için URL'den al
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const activeCategoryId = params.get('category');
  // Header'daki kategori kısayolları kaldırıldı
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }} className={darkMode ? 'dark' : ''}>
      {/* Header */}
      <CHeader position="sticky" className="px-3 d-flex align-items-center justify-content-between" style={{ minHeight: 64 }}>
        <div className="d-flex align-items-center">
          <CButton color="light" variant="ghost" onClick={() => setSidebarVisible(v => !v)} className="me-2">
            <FiMenu size={20} />
          </CButton>
          <CHeaderBrand onClick={() => navigate('/')} style={{ cursor: 'pointer' }} className="fw-bold">SHOP<span className="logo-highlight">{darkMode ? 'DARK' : 'LIGHT'}</span></CHeaderBrand>
        </div>
        {/* Modern arama barı ortada */}
        <div className="header-search-wrapper flex-grow-1 d-flex justify-content-center">
          <CForm onSubmit={handleSearch} className="header-search-form">
            <CInputGroup className="header-search-group">
              <span className="input-group-text bg-white border-0 ps-3"><FiSearch size={18} /></span>
              <CFormInput
                type="text"
                placeholder="Ürün, kategori veya marka ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              <CButton type="submit" color="primary" className="header-search-btn">Ara</CButton>
            </CInputGroup>
          </CForm>
        </div>
        <CHeaderNav className="d-flex align-items-center gap-2 ms-2">
          <CButton color="light" variant="ghost" onClick={() => setDarkMode && setDarkMode(!darkMode)} title={darkMode ? 'Açık mod' : 'Koyu mod'}>
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </CButton>
          <CNavItem>
            <CNavLink onClick={() => navigate('/campaigns')} style={{ cursor: 'pointer' }}><FiGift size={20} className="me-1" />Kampanyalar</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => {
              const userId = localStorage.getItem('userId');
              if (userId) {
                navigate(`/profile/${userId}?tab=favorites`);
              } else {
                navigate('/login');
              }
            }} style={{ cursor: 'pointer', position: 'relative' }}>
              <FiHeart size={20} />
              {favoritesCount > 0 && <CBadge color="danger" className="position-absolute top-0 start-100 translate-middle">{favoritesCount}</CBadge>}
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => navigate('/cart')} style={{ cursor: 'pointer', position: 'relative' }}>
              <FiShoppingCart size={20} />
              {cartItems.length > 0 && (
                <CBadge color="danger" className="position-absolute top-0 start-100 translate-middle">{cartItems.length}</CBadge>
              )}
            </CNavLink>
          </CNavItem>
          {/* Bildirim (zil) ikonu */}
          {isLoggedIn && userId && (
            <CNavItem style={{ position: 'relative' }}>
              <CNavLink style={{ cursor: 'pointer', position: 'relative' }} onClick={handleNotificationClick} aria-label="Bildirimler">
                <FiBell size={20} />
                {notificationCount > 0 && (
                  <CBadge color="danger" className="position-absolute top-0 start-100 translate-middle">{notificationCount}</CBadge>
                )}
              </CNavLink>
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
            </CNavItem>
          )}
          {/* Profil Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="profile-dropdown" className="d-flex align-items-center gap-2 border-0 bg-transparent">
              <FiUser size={20} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {isLoggedIn && userId ? (
                <>
                  <Dropdown.Item onClick={() => navigate(`/profile/${userId}`)}><FiUser className="me-2" />Profilim</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate(`/profile/${userId}?tab=orders`)}><FiShoppingCart className="me-2" />Siparişlerim</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate(`/profile/${userId}?tab=favorites`)}><FiHeart className="me-2" />Favorilerim</Dropdown.Item>
                  {role === 'Admin' && <Dropdown.Item onClick={() => navigate('/admin')}><FiGift className="me-2" />Admin Paneli</Dropdown.Item>}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}><FiLogOut className="me-2" />Çıkış Yap</Dropdown.Item>
                </>
              ) : (
                <>
                  <Dropdown.Item onClick={() => navigate('/login')}><FiLogIn className="me-2" />Giriş Yap</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/register')}><FiUserPlus className="me-2" />Kayıt Ol</Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </CHeaderNav>
      </CHeader>
      {/* Kategori Dropdown + 10 kategori barı */}
      <div className="category-bar-shadow">
        <div className="category-bar-flex">
          {/* CoreUI Dropdown */}
          <CDropdown className="category-bar-dropdown">
            <CDropdownToggle color="light" className="category-bar-dropdown-toggle">
              {activeCategoryId
                ? categories.find(cat => String(cat.id) === activeCategoryId)?.name || 'Kategoriler'
                : 'TÜM KATEGORİLER'}
            </CDropdownToggle>
            <CDropdownMenu className="category-bar-dropdown-menu">
              <CDropdownItem
                active={!activeCategoryId}
                onClick={() => navigate('/products')}
              >
                TÜM KATEGORİLER
              </CDropdownItem>
              {categories.map(cat => (
                <CDropdownItem
                  key={cat.id}
                  active={activeCategoryId === String(cat.id)}
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                >
                  {cat.name}
                </CDropdownItem>
              ))}
            </CDropdownMenu>
          </CDropdown>
          {/* Sağda TÜM KATEGORİLER + 9 kategori */}
          <div className="category-bar-list">
            <CButton
              color={!activeCategoryId ? 'primary' : 'light'}
              className={`category-bar-btn ${!activeCategoryId ? 'active' : ''}`}
              onClick={() => navigate('/products')}
            >
              TÜM KATEGORİLER
            </CButton>
            {categories.slice(0, 9).map(cat => (
              <CButton
                key={cat.id}
                color={activeCategoryId === String(cat.id) ? 'primary' : 'light'}
                className={`category-bar-btn ${activeCategoryId === String(cat.id) ? 'active' : ''}`}
                onClick={() => navigate(`/products?category=${cat.id}`)}
              >
                {cat.name}
              </CButton>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <CSidebar visible={sidebarVisible} style={{ minWidth: sidebarWidth, width: sidebarWidth, transition: 'width 0.2s' }}>
          {sidebarVisible && (
            <CSidebarBrand className="fw-bold">SHOP</CSidebarBrand>
          )}
          <CSidebarNav>
            <CNavItem>
              <CNavLink onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Ana Sayfa</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>Ürünler</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink onClick={() => navigate('/categories')} style={{ cursor: 'pointer' }}>Kategoriler</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink onClick={() => navigate('/about')} style={{ cursor: 'pointer' }}>Hakkımızda</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink onClick={() => navigate('/contact')} style={{ cursor: 'pointer' }}>İletişim</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink onClick={() => navigate('/faq')} style={{ cursor: 'pointer' }}>SSS</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink onClick={() => navigate('/campaigns')} style={{ cursor: 'pointer' }}>Kampanyalar</CNavLink>
            </CNavItem>
            {role === 'Admin' && (
              <CNavItem>
                <CNavLink onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>Admin Paneli</CNavLink>
              </CNavItem>
            )}
          </CSidebarNav>
        </CSidebar>

        {/* Ana içerik alanı */}
        <main style={{ flex: 1, minHeight: '80vh' }}>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <CFooter className="d-flex flex-column align-items-center py-3">
        <div className="mb-2">
          <span className="fw-bold">SHOP</span>
          <span className="logo-highlight ms-1">{darkMode ? 'DARK' : 'LIGHT'}</span>
        </div>
        <div className="mb-2">
          <a href="/" className="me-3">Anasayfa</a>
          <a href="/products" className="me-3">Ürünler</a>
          <a href="/about" className="me-3">Hakkımızda</a>
          <a href="/contact" className="me-3">İletişim</a>
          <a href="/faq" className="me-3">SSS</a>
        </div>
        <div>
          <span>© {new Date().getFullYear()} SHOP. Tüm hakları saklıdır.</span>
        </div>
      </CFooter>
    </div>
  );
};

export default CoreUILayout; 