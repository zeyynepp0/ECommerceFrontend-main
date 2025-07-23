import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../utils/api';
import {
  CContainer,
  CCard,
  CCardBody,
  CCardTitle,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CFormSelect,
  CBadge,
  CTooltip
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

// Kullanıcı isteği için badge renkleri
const userRequestBadge = (requestText) => {
  switch (requestText) {
    case 'İptal Talebi':
      return <CBadge color="danger">{requestText}</CBadge>;
    case 'İade Talebi':
      return <CBadge color="warning">{requestText}</CBadge>;
    case 'Yok':
    default:
      return <CBadge color="secondary">{requestText}</CBadge>;
  }
};

const adminStatusOptions = [
  { value: 'None', label: 'Yok' },
  { value: 'InReview', label: 'İncelemede' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Completed', label: 'Tamamlandı' }
];

const adminStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return <CBadge color="success">Tamamlandı</CBadge>;
    case 'Rejected':
      return <CBadge color="danger">Reddedildi</CBadge>;
    case 'InReview':
      return <CBadge color="info">İncelemede</CBadge>;
    case 'Approved':
      return <CBadge color="warning">Onaylandı</CBadge>;
    case 'None':
    default:
      return <CBadge color="secondary">Yok</CBadge>;
  }
};

const statusBadge = (statusText) => {
  switch (statusText) {
    case 'İptal Edildi':
      return <CBadge color="danger">{statusText}</CBadge>;
    case 'Onay Bekliyor':
      return <CBadge color="secondary">{statusText}</CBadge>;
    case 'Onaylandı':
      return <CBadge color="warning">{statusText}</CBadge>;
    case 'Hazırlanıyor':
      return <CBadge color="info">{statusText}</CBadge>;
    case 'Kargoya Verildi':
      return <CBadge color="primary">{statusText}</CBadge>;
    case 'Teslim Edildi':
      return <CBadge color="success">{statusText}</CBadge>;
    case 'İade Talebi':
      return <CBadge color="dark">{statusText}</CBadge>;
    case 'İade Edildi':
      return <CBadge color="success">{statusText}</CBadge>;
    default:
      return <CBadge color="secondary">{statusText}</CBadge>;
  }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiGet('/api/Admin/orders');
      setOrders(response);
      setError('');
    } catch (err) {
      setError('Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRequestAction = async (orderId, action) => {
    try {
      if (action === 'approve') {
        // Kullanıcının isteğine göre (iptal/iade) uygun endpoint'i çağır
        const order = orders.find(o => o.id === orderId);
        if (order.userRequestText === 'İptal Talebi') {
          await apiPost(`/api/admin/order/${orderId}/cancel/approve`);
        } else if (order.userRequestText === 'İade Talebi') {
          await apiPost(`/api/admin/order/${orderId}/refund/approve`);
        }
      } else if (action === 'reject') {
        await apiPost(`/api/admin/order/${orderId}/user-request/reject`);
      }
      await fetchOrders(); // Siparişleri yenile
      setError('');
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu.');
    }
  };

  if (loading) return <CSpinner color="primary" />;

  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <CCardTitle>Siparişler</CCardTitle>
          {error && <CAlert color="danger">{error}</CAlert>}
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Sipariş No</CTableHeaderCell>
                <CTableHeaderCell>Müşteri</CTableHeaderCell>
                <CTableHeaderCell>Tarih</CTableHeaderCell>
                <CTableHeaderCell>Tutar</CTableHeaderCell>
                <CTableHeaderCell>Durum</CTableHeaderCell>
                <CTableHeaderCell>Kullanıcı İsteği</CTableHeaderCell>
                <CTableHeaderCell>Sipariş Durumu</CTableHeaderCell>
                <CTableHeaderCell>İşlemler</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(orders || []).map(order => {
                // DEBUG: Konsolda bak
                console.log('Order:', order.status, order.statusText);
                const isCancelled = order.status === 5 || order.status === 'Cancelled' || order.statusText === 'İptal Edildi';
                const isRefunded = order.status === 7 || order.status === 'Refunded' || order.statusText === 'İade Edildi';
                return (
                  <CTableRow
                    key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className={
                      isCancelled
                        ? 'table-danger'
                        : isRefunded
                          ? 'table-warning'
                          : ''
                    }
                  >
                    <CTableDataCell>{order.id}</CTableDataCell>
                    <CTableDataCell>{order.userEmail || 'Bilinmiyor'}</CTableDataCell>
                    <CTableDataCell>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</CTableDataCell>
                    <CTableDataCell>{order.totalAmount.toFixed(2)}₺</CTableDataCell>
                    <CTableDataCell>{statusBadge(order.statusText)}</CTableDataCell>
                    <CTableDataCell>
                      {userRequestBadge(order.userRequestText)}
                      {order.userRequestText !== 'Yok' && (
                        <div className="mt-2">
                          <CButton
                            color="success"
                            size="sm"
                            className="me-2"
                            onClick={e => {
                              e.stopPropagation();
                              handleUserRequestAction(order.id, 'approve');
                            }}
                          >
                            Onayla
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              handleUserRequestAction(order.id, 'reject');
                            }}
                          >
                            Reddet
                          </CButton>
                        </div>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormSelect
                        size="sm"
                        value={order.status}
                        onClick={e => e.stopPropagation()}
                        onChange={async e => {
                          const newStatus = e.target.value;
                          await apiPost(`/api/admin/order/${order.id}/status?status=${newStatus}`);
                          fetchOrders();
                        }}
                        disabled={isCancelled || isRefunded}
                      >
                        <option value="Pending">Onay Bekliyor</option>
                        <option value="Approved">Onaylandı</option>
                        <option value="Preparing">Hazırlanıyor</option>
                        <option value="Shipped">Kargoya Verildi</option>
                        <option value="Delivered">Teslim Edildi</option>
                        <option value="Cancelled">İptal Edildi</option>
                        <option value="Returned">İade Talebi</option>
                        <option value="Refunded">İade Edildi</option>
                      </CFormSelect>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/admin/orders/${order.id}`);
                        }}
                      >
                        Detay
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                );
              })}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default OrdersPage; 