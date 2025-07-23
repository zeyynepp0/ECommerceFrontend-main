import React, { useEffect, useState } from 'react';
import { apiGet } from '../../utils/api';
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CSpinner, CAlert, CButton
} from '@coreui/react';
import { FiUsers, FiBox, FiLayers, FiShoppingCart, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const statCards = [
  {
    key: 'userCount',
    title: 'Kullanıcılar',
    icon: <FiUsers size={36} />, 
    color: 'primary',
    to: '/admin/users',
  },
  {
    key: 'productCount',
    title: 'Ürünler',
    icon: <FiBox size={36} />, 
    color: 'success',
    to: '/admin/products',
  },
  {
    key: 'categoryCount',
    title: 'Kategoriler',
    icon: <FiLayers size={36} />, 
    color: 'warning',
    to: '/admin/categories',
  },
  {
    key: 'orderCount',
    title: 'Siparişler',
    icon: <FiShoppingCart size={36} />, 
    color: 'danger',
    to: '/admin/orders',
  },
  {
    key: 'shippingCompanyCount',
    title: 'Kargo Firmaları',
    icon: <FiLayers size={36} />, 
    color: 'info',
    to: '/admin/shipping-companies',
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
      .catch(() => setError('Dashboard verileri yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CContainer className="py-4">
      <h2 className="fw-bold mb-4">Admin Paneli - Genel Bakış</h2>
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
                    Tümünü Gör <FiChevronRight />
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
              <CCardTitle className="fs-5 fw-bold mb-2">Kısa Yollar</CCardTitle>
              <div className="d-flex flex-wrap gap-2">
                <CButton color="primary" variant="outline" onClick={() => navigate('/admin/users')}>Kullanıcılar</CButton>
                <CButton color="success" variant="outline" onClick={() => navigate('/admin/products')}>Ürünler</CButton>
                <CButton color="warning" variant="outline" onClick={() => navigate('/admin/categories')}>Kategoriler</CButton>
                <CButton color="danger" variant="outline" onClick={() => navigate('/admin/orders')}>Siparişler</CButton>
                <CButton color="info" variant="outline" onClick={() => navigate('/admin/revenue')}>Gelir Raporu</CButton>
                <CButton color="secondary" variant="outline" onClick={() => navigate('/admin/user-activity')}>Kullanıcı Aktiviteleri</CButton>
                <CButton color="dark" variant="outline" onClick={() => navigate('/admin/reviews')}>Yorumlar</CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={6}>
          <CCard className="h-100 shadow-sm">
            <CCardBody>
              <CCardTitle className="fs-5 fw-bold mb-2">Hoş Geldiniz!</CCardTitle>
              <CCardText>
                Bu panelden kullanıcıları, ürünleri, kategorileri, siparişleri ve daha fazlasını kolayca yönetebilirsiniz. Sol menüden veya yukarıdaki kısa yollardan istediğiniz sayfaya hızlıca geçiş yapabilirsiniz.
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default DashboardPage;
