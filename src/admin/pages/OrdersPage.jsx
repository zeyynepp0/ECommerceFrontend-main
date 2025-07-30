// Sipariş yönetim sayfası - Sipariş listeleme, durum güncelleme, kullanıcı taleplerini onaylama/reddetme
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
      return <CBadge color="danger">Cancel Request</CBadge>;
    case 'İade Talebi':
      return <CBadge color="warning">Refund Request</CBadge>;
    case 'Yok':
      return <CBadge color="secondary">None</CBadge>;
    default:
      return <CBadge color="secondary">{requestText}</CBadge>;
  }
};

// Admin onay durumu için badge renkleri
const adminStatusOptions = [
  { value: 'None', label: 'None' },
  { value: 'InReview', label: 'In Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Completed', label: 'Completed' }
];
const adminStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return <CBadge color="success">Completed</CBadge>;
    case 'Rejected':
      return <CBadge color="danger">Rejected</CBadge>;
    case 'InReview':
      return <CBadge color="info">In Review</CBadge>;
    case 'Approved':
      return <CBadge color="warning">Approved</CBadge>;
    case 'None':
      return <CBadge color="secondary">None</CBadge>;
    default:
      return <CBadge color="secondary">{status}</CBadge>;
  }
};

// Sipariş durumu için badge renkleri
const statusBadge = (statusText) => {
  switch (statusText) {
    case 'İptal Edildi':
      return <CBadge color="danger">Cancelled</CBadge>;
    case 'Onay Bekliyor':
      return <CBadge color="secondary">Pending Approval</CBadge>;
    case 'Onaylandı':
      return <CBadge color="warning">Approved</CBadge>;
    case 'Hazırlanıyor':
      return <CBadge color="info">Preparing</CBadge>;
    case 'Kargoya Verildi':
      return <CBadge color="primary">Shipped</CBadge>;
    case 'Teslim Edildi':
      return <CBadge color="success">Delivered</CBadge>;
    case 'İade Talebi':
      return <CBadge color="secondary">Refund Requested</CBadge>; // 'dark' yerine 'secondary' kullanıldı
    case 'İade Edildi':
      return <CBadge color="success">Refunded</CBadge>;
    default:
      return <CBadge color="secondary">{statusText}</CBadge>;
  }
};

const OrdersPage = () => {
  // Sipariş verileri ve durum state'leri
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Sayfa yönlendirme için hook
  const navigate = useNavigate();

  // Sayfa yüklendiğinde siparişleri backend'den çek
  useEffect(() => {
    fetchOrders();
  }, []);

  // Siparişleri backend'den çek
  const fetchOrders = async () => {
    try {
      const response = await apiGet('/api/Admin/orders');
      setOrders(response);
      setError('');
    } catch (err) {
      setError('An error occurred while loading orders.');
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı talebini onayla/reddet işlemleri
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
      setError('An error occurred during the operation.');
    }
  };

  // Yükleniyor durumu
  if (loading) return <CSpinner color="primary" />;

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <CCardTitle>Orders</CCardTitle>
          {/* Hata mesajı */}
          {error && <CAlert color="danger">{error}</CAlert>}
          {/* Siparişler tablosu */}
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Order No</CTableHeaderCell>
                <CTableHeaderCell>Customer</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Amount</CTableHeaderCell>
                <CTableHeaderCell>Campaign</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>User Request</CTableHeaderCell>
                <CTableHeaderCell>Order Status</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(orders || []).map(order => {
                // Siparişin iptal/iadeli olup olmadığını kontrol et
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
                    <CTableDataCell>{order.userEmail || 'Unknown'}</CTableDataCell>
                    <CTableDataCell>{new Date(order.createdAt).toLocaleDateString()}</CTableDataCell>
                    <CTableDataCell>{order.totalAmount.toFixed(2)}₺</CTableDataCell>
                    <CTableDataCell>
                      {order.campaignName ? (
                        <span>{order.campaignName }</span>
                      ) : (
                        <span>-</span>
                      )}
                    </CTableDataCell>
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
                            Approve
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              handleUserRequestAction(order.id, 'reject');
                            }}
                          >
                            Reject
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
                        <option value="Pending">Pending Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Refund Requested</option>
                        <option value="Refunded">Refunded</option>
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
                        Detail
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