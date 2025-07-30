// Kullanıcı aktiviteleri sayfası - Kullanıcıların son sipariş, son yorum ve toplam aktiviteleri
import React, { useEffect, useState } from 'react';
import { apiGet } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const UserActivityPage = () => {
  // Aktivite verisi ve durum state'leri
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Sayfa yönlendirme için hook
  const navigate = useNavigate();

  // Sayfa yüklendiğinde kullanıcı aktivitelerini backend'den çek
  useEffect(() => {
    apiGet('https://localhost:7098/api/Admin/user-activity')
      .then(setActivity)
      .catch(() => setError('Activities could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <CCardTitle>User Activities</CCardTitle>
          {/* Yükleniyor/hata/aktivite tablosu */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Full Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Last Order</CTableHeaderCell>
                  <CTableHeaderCell>Last Review</CTableHeaderCell>
                  <CTableHeaderCell>Total Orders</CTableHeaderCell>
                  <CTableHeaderCell>Total Reviews</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {activity.map((item, i) => (
                  <CTableRow key={i}>
                    {/* Kullanıcıya tıklanınca detay sayfasına git */}
                    <CTableDataCell style={{ color: '#0d6efd', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate(`/admin/users/${item.userId}`)}>{item.fullName}</CTableDataCell>
                    <CTableDataCell>{item.email}</CTableDataCell>
                    <CTableDataCell>{item.lastOrderDate ? new Date(item.lastOrderDate).toLocaleString() : 'None'}</CTableDataCell>
                    <CTableDataCell>{item.lastReviewDate ? new Date(item.lastReviewDate).toLocaleString() : 'None'}</CTableDataCell>
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