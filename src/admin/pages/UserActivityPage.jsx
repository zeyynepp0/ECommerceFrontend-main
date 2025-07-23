import React, { useEffect, useState } from 'react';
import { apiGet } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const UserActivityPage = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    apiGet('http://localhost:5220/api/Admin/user-activity')
      .then(setActivity)
      .catch(() => setError('Aktiviteler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <CCardTitle>Kullanıcı Aktiviteleri</CCardTitle>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Ad Soyad</CTableHeaderCell>
                  <CTableHeaderCell>E-posta</CTableHeaderCell>
                  <CTableHeaderCell>Son Sipariş</CTableHeaderCell>
                  <CTableHeaderCell>Son Yorum</CTableHeaderCell>
                  <CTableHeaderCell>Toplam Sipariş</CTableHeaderCell>
                  <CTableHeaderCell>Toplam Yorum</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {activity.map((item, i) => (
                  <CTableRow key={i}>
                    <CTableDataCell style={{ color: '#0d6efd', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate(`/admin/users/${item.userId}`)}>{item.fullName}</CTableDataCell>
                    <CTableDataCell>{item.email}</CTableDataCell>
                    <CTableDataCell>{item.lastOrderDate ? new Date(item.lastOrderDate).toLocaleString() : 'Yok'}</CTableDataCell>
                    <CTableDataCell>{item.lastReviewDate ? new Date(item.lastReviewDate).toLocaleString() : 'Yok'}</CTableDataCell>
                    <CTableDataCell>{item.totalOrders}</CTableDataCell>
                    <CTableDataCell>{item.totalReviews}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};
export default UserActivityPage; 