import React, { useEffect, useState } from 'react';
import { apiGet } from '../../utils/api';
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CSpinner, CAlert, CButton
} from '@coreui/react';
import { FiUsers, FiBox, FiLayers, FiShoppingCart, FiChevronRight, FiGift } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const statCards = [
  {
    key: 'userCount',
    title: 'Users',
    icon: <FiUsers size={36} />, 
    color: 'primary',
    to: '/admin/users',
  },
  {
    key: 'productCount',
    title: 'Products',
    icon: <FiBox size={36} />, 
    color: 'success',
    to: '/admin/products',
  },
  {
    key: 'categoryCount',
    title: 'Categories',
    icon: <FiLayers size={36} />, 
    color: 'warning',
    to: '/admin/categories',
  },
  {
    key: 'orderCount',
    title: 'Orders',
    icon: <FiShoppingCart size={36} />, 
    color: 'danger',
    to: '/admin/orders',
  },
  {
    key: 'shippingCompanyCount',
    title: 'Shipping Companies',
    icon: <FiLayers size={36} />, 
    color: 'info',
    to: '/admin/shipping-companies',
  },
  {
    key: 'campaignCount',
    title: 'Campaigns',
    icon: <FiGift size={36} />, 
    color: 'secondary',
    to: '/admin/campaigns',
  },
];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    apiGet('http://localhost:5220/api/Admin/dashboard')
      .then(setStats)
      .catch(() => setError('Dashboard data could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CContainer className="py-4">
      <h2 className="fw-bold mb-4">Admin Panel - Overview</h2>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : stats ? (
        <CRow className="g-4 mb-4">
          {statCards.map(card => (
            <CCol xs={12} sm={6} md={3} key={card.key}>
              <CCard className={`text-center border-0 shadow-lg bg-${card.color} bg-opacity-10 h-100 dashboard-stat-card`}>
                <CCardBody>
                  <div className={`mb-2 text-${card.color}`}>{card.icon}</div>
                  <CCardTitle className="fs-5 fw-semibold mb-1">{card.title}</CCardTitle>
                  <CCardText className={`fs-2 fw-bold text-${card.color}`}>{stats[card.key]}</CCardText>
                  <CButton color={card.color} variant="outline" className="mt-2 px-3 py-1" onClick={() => navigate(card.to)}>
                    View All <FiChevronRight />
                  </CButton>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      ) : null}
      <CRow className="g-4">
        <CCol xs={12} md={6}>
          <CCard className="h-100 shadow-sm">
            <CCardBody>
              <CCardTitle className="fs-5 fw-bold mb-2">Shortcuts</CCardTitle>
              <div className="d-flex flex-wrap gap-2">
                <CButton color="primary" variant="outline" onClick={() => navigate('/admin/users')}>Users</CButton>
                <CButton color="success" variant="outline" onClick={() => navigate('/admin/products')}>Products</CButton>
                <CButton color="warning" variant="outline" onClick={() => navigate('/admin/categories')}>Categories</CButton>
                <CButton color="danger" variant="outline" onClick={() => navigate('/admin/orders')}>Orders</CButton>
                <CButton color="info" variant="outline" onClick={() => navigate('/admin/revenue')}>Revenue Report</CButton>
                <CButton color="secondary" variant="outline" onClick={() => navigate('/admin/user-activity')}>User Activities</CButton>
                <CButton color="dark" variant="outline" onClick={() => navigate('/admin/reviews')}>Reviews</CButton>
                <CButton color="secondary" variant="outline" onClick={() => navigate('/admin/campaigns')}>Campaigns</CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={6}>
          <CCard className="h-100 shadow-sm">
            <CCardBody>
              <CCardTitle className="fs-5 fw-bold mb-2">Welcome!</CCardTitle>
              <CCardText>
                You can easily manage users, products, categories, orders, and more from this panel. You can quickly navigate to any page using the left menu or the shortcuts above.
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default DashboardPage;
