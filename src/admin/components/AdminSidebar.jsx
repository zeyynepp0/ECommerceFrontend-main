// Admin paneli sidebar bileşeni - Navigasyon menüsü
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavLink
} from '@coreui/react';

const AdminSidebar = ({ sidebarWidth = 200, role }) => {
  // Sayfa yönlendirme için hook
  const navigate = useNavigate();
  // Navigasyon fonksiyonu
  const handleNav = (path) => {
    navigate(path);
  };
  // Sidebar arayüzü
  return (
    <CSidebar
      visible={true}
      style={{ minWidth: sidebarWidth, width: sidebarWidth, transition: 'width 0.2s' }}
    >
      {/* Sidebar başlığı */}
      <CSidebarBrand className="fw-bold">SHOP</CSidebarBrand>
      <CSidebarNav>
        {/* Genel kullanıcı menüleri */}
        <CNavItem>
          <CNavLink onClick={() => handleNav('/')} style={{ cursor: 'pointer' }}>Home</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/products')} style={{ cursor: 'pointer' }}>Products</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/categories')} style={{ cursor: 'pointer' }}>Categories</CNavLink>
        </CNavItem>
        {/* Admin menüleri */}
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin')} style={{ cursor: 'pointer' }}>Admin Panel</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/users')} style={{ cursor: 'pointer' }}>Users</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/products')} style={{ cursor: 'pointer' }}>Products</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/categories')} style={{ cursor: 'pointer' }}>Categories</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/orders')} style={{ cursor: 'pointer' }}>Orders</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/revenue')} style={{ cursor: 'pointer' }}>Revenue Report</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/user-activity')} style={{ cursor: 'pointer' }}>User Activities</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/reviews')} style={{ cursor: 'pointer' }}>Reviews</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/shipping-companies')} style={{ cursor: 'pointer' }}>Shipping Companies</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/admin/campaigns')} style={{ cursor: 'pointer' }}>Campaigns</CNavLink>
        </CNavItem>
      </CSidebarNav>
    </CSidebar>
  );
};
export default AdminSidebar; 
