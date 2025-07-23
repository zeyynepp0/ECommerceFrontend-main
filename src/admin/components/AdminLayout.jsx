import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import { CContainer, CRow, CCol, CHeader, CHeaderBrand, CHeaderNav, CNavItem, CNavLink, CButton, CBadge } from '@coreui/react';
import { FiMenu, FiUser, FiShoppingCart, FiHeart, FiGift, FiLogIn, FiLogOut, FiUserPlus, FiSun, FiMoon, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/userSlice';
import { selectFavoritesCount, clearFavorites } from '../../store/favoriteSlice';
import { clearCart } from '../../store/cartSlice';
import { Dropdown } from 'react-bootstrap';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminLayout = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector(state => state.user);
  const isLoggedIn = reduxUser?.userId || localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const favoritesCount = useSelector(selectFavoritesCount);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const adminId = localStorage.getItem('userId');
  const notificationDropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);

  useEffect(() => {
    if (adminId) fetchUnreadCount();
  }, [adminId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showNotifications &&
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const count = await fetch(`http://localhost:5220/api/Notification/unread-count/${adminId}`).then(r => r.json());
      setNotificationCount(count);
    } catch {}
  };
  const fetchNotifications = async () => {
    try {
      const notifs = await fetch(`http://localhost:5220/api/Notification/user/${adminId}`).then(r => r.json());
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
    await fetch(`http://localhost:5220/api/Notification/mark-all-as-read/${adminId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    await fetchNotifications();
    await fetchUnreadCount();
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    dispatch(logout());
    dispatch(clearFavorites());
    dispatch(clearCart());
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CHeader position="sticky" className="px-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <CButton color="light" variant="ghost" onClick={() => setSidebarVisible(v => !v)} className="me-2">
            <FiMenu size={20} />
          </CButton>
          <CHeaderBrand onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }} className="fw-bold">Admin Panel</CHeaderBrand>
        </div>
        <CHeaderNav className="ms-auto d-flex align-items-center gap-2">
          {/* Bildirim ikonu */}
          <div className="header-icon notification" style={{ position: 'relative', marginRight: 8 }}>
            <button ref={notificationButtonRef} onClick={handleNotificationClick} style={{ background: 'none', border: 'none', position: 'relative' }} aria-label="Bildirimler">
              <FiBell size={20} />
              {notificationCount > 0 && <span className="icon-badge" style={{ position: 'absolute', top: -6, right: -6, background: 'red', color: 'white', borderRadius: '50%', fontSize: 12, padding: '2px 6px' }}>{notificationCount}</span>}
            </button>
            {showNotifications && (
              <div className="notification-dropdown" ref={notificationDropdownRef} style={{ position: 'absolute', right: 0, top: 32, zIndex: 1000, background: '#fff', border: '1px solid #eee', borderRadius: 8, minWidth: 320, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                  <span className="fw-bold">Bildirimler</span>
                  <button className="btn btn-link btn-sm" onClick={handleMarkAllAsRead}>Mark All as Read</button>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="p-3 text-center text-muted">No notifications.</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`p-2 border-bottom ${n.isRead ? '' : 'bg-light'}`}>{n.message}<br /><small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small></div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* <CNavItem>
            <CNavLink onClick={() => navigate('/campaigns')} style={{ cursor: 'pointer' }}><FiGift size={20} className="me-1" />Campaigns</CNavLink>
          </CNavItem> */}
          <CNavItem>
            <CNavLink onClick={() => navigate('/cart')} style={{ cursor: 'pointer', position: 'relative' }}>
              <FiShoppingCart size={20} />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => navigate('/profile/' + isLoggedIn + '?tab=favorites')} style={{ cursor: 'pointer', position: 'relative' }}>
              <FiHeart size={20} />
              {favoritesCount > 0 && <CBadge color="danger" className="position-absolute top-0 start-100 translate-middle">{favoritesCount}</CBadge>}
            </CNavLink>
          </CNavItem>
          {/* Profil Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="profile-dropdown" className="d-flex align-items-center gap-2 border-0 bg-transparent">
              <FiUser size={20} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {isLoggedIn ? (
                <>
                  <Dropdown.Item onClick={() => navigate(`/profile/${isLoggedIn}`)}><FiUser className="me-2" />My Profile</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate(`/profile/${isLoggedIn}?tab=orders`)}><FiShoppingCart className="me-2" />My Orders</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate(`/profile/${isLoggedIn}?tab=favorites`)}><FiHeart className="me-2" />Favorites</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/admin')}><FiGift className="me-2" />Admin Panel</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}><FiLogOut className="me-2" />Logout</Dropdown.Item>
                </>
              ) : (
                <>
                  <Dropdown.Item onClick={() => navigate('/login')}><FiLogIn className="me-2" />Login</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/register')}><FiUserPlus className="me-2" />Register</Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </CHeaderNav>
      </CHeader>
      <CContainer fluid className="py-4" style={{ flex: 1 }}>
        <CRow>
          <CCol xs={12} md={3} lg={2} className="mb-4 mb-md-0">
            <AdminSidebar sidebarVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
          </CCol>
          <CCol xs={12} md={9} lg={10}>
            <Outlet />
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};
export default AdminLayout; 