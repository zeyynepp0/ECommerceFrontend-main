import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavLink
} from '@coreui/react';

const AdminSidebar = ({ sidebarVisible = true, sidebarWidth = 200, role, onClose }) => {
  const navigate = useNavigate();
  // Yardımcı fonksiyon: önce navigate, sonra sidebar'ı kapat
  const handleNav = (path) => {
    navigate(path);
    // onClose'u kaldırdık, sadece kapama butonunda çalışacak
  };
  return (
    <CSidebar visible={sidebarVisible} style={{ minWidth: sidebarWidth, width: sidebarWidth, transition: 'width 0.2s' }} onHide={onClose}>
      {sidebarVisible && (
        <CSidebarBrand className="fw-bold">SHOP
          <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }} aria-label="Close">×</button>
        </CSidebarBrand>
      )}
      <CSidebarNav>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/') } style={{ cursor: 'pointer' }}>Home</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/products') } style={{ cursor: 'pointer' }}>Products</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/categories') } style={{ cursor: 'pointer' }}>Categories</CNavLink>
        </CNavItem>
        {/* <CNavItem>
          <CNavLink onClick={() => handleNav('/about') } style={{ cursor: 'pointer' }}>About Us</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/contact') } style={{ cursor: 'pointer' }}>Contact</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink onClick={() => handleNav('/faq') } style={{ cursor: 'pointer' }}>FAQ</CNavLink>
        </CNavItem> */}
       {/*  <CNavItem>
          <CNavLink onClick={() => handleNav('/campaigns') } style={{ cursor: 'pointer' }}>Campaigns</CNavLink>
        </CNavItem> */}
        
          <CNavItem>
            <CNavLink onClick={() => handleNav('/admin') } style={{ cursor: 'pointer' }}>Admin Panel</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => handleNav('/admin/users') } style={{ cursor: 'pointer' }}>Users</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => handleNav('/admin/products') } style={{ cursor: 'pointer' }}>Products</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => handleNav('/admin/categories') } style={{ cursor: 'pointer' }}>Categories</CNavLink>
          </CNavItem><CNavItem>
            <CNavLink onClick={() => handleNav('/admin/orders') } style={{ cursor: 'pointer' }}>Orders</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => handleNav('/admin/revenue') } style={{ cursor: 'pointer' }}>Revenue Report</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => handleNav('/admin/user-activity') } style={{ cursor: 'pointer' }}>User Activities</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => handleNav('/admin/reviews') } style={{ cursor: 'pointer' }}>Reviews</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink onClick={() => handleNav('/admin/shipping-companies') } style={{ cursor: 'pointer' }}>Shipping Companies</CNavLink>
          </CNavItem>
          

         
        
      </CSidebarNav>
    </CSidebar>
  );
};
export default AdminSidebar; 
