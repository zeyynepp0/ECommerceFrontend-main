import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavLink
} from '@coreui/react';

const AdminSidebar = ({ sidebarVisible = true, sidebarWidth = 200, role }) => {
  const navigate = useNavigate();
  return (
    <CSidebar visible={sidebarVisible} style={{ minWidth: sidebarWidth, width: sidebarWidth, transition: 'width 0.2s' }}>
      {sidebarVisible && (
        <CSidebarBrand className="fw-bold">SHOP</CSidebarBrand>
      )}
      <CSidebarNav>
        {/* Genel linkler */}
        <CNavItem>
          <CNavLink onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Ana Sayfa</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>Ürünler</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/categories')} style={{ cursor: 'pointer' }}>Kategoriler</CNavLink>
        </CNavItem>
        {/* Admin özel linkler */}
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>Dashboard</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>Kullanıcılar</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin/products')} style={{ cursor: 'pointer' }}>Ürünler</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin/categories')} style={{ cursor: 'pointer' }}>Kategoriler</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>Siparişler</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin/reviews')} style={{ cursor: 'pointer' }}>Yorumlar</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin/revenue')} style={{ cursor: 'pointer' }}>Gelir Raporu</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin/user-activity')} style={{ cursor: 'pointer' }}>Kullanıcı Aktiviteleri</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => navigate('/admin/shipping-companies')} style={{ cursor: 'pointer' }}>Kargo Firmaları</CNavLink>
        </CNavItem>
      </CSidebarNav>
    </CSidebar>
  );
};
export default AdminSidebar; 