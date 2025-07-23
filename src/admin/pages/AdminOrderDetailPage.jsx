import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CCardText, CSpinner, CAlert, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CButton
} from '@coreui/react';

const API_BASE = "http://localhost:5220";

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await apiGet(`${API_BASE}/api/Order/${id}`);
        setOrder(data);
      } catch {
        setError('Sipariş detayları yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>;
  if (error) return <CAlert color="danger">{error}</CAlert>;
  if (!order) return <CAlert color="warning">Sipariş bulunamadı.</CAlert>;

  // Durum badge'i
  const statusBadge = (statusText) => {
    const map = {
      'Onay Bekliyor': 'warning',
      'Onaylandı': 'success',
      'Hazırlanıyor': 'info',
      'Kargoya Verildi': 'primary',
      'Teslim Edildi': 'success',
      'İptal Edildi': 'danger',
      'İade Talebi': 'dark',
      'İade Edildi': 'success',
    };
    return <CBadge color={map[statusText] || 'secondary'} className="fs-6">{statusText}</CBadge>;
  };

  const handleApproveUserRequest = async () => {
    if (!order) return;
    let endpoint = '';
    if (order.userRequestText === 'İptal Talebi') endpoint = `/api/admin/order/${order.id}/cancel/approve`;
    else if (order.userRequestText === 'İade Talebi') endpoint = `/api/admin/order/${order.id}/refund/approve`;
    if (!endpoint) return;
    try {
      await apiPost(endpoint);
      window.location.reload();
    } catch (err) {
      alert('İşlem başarısız: ' + (err?.message || ''));
    }
  };
  const handleRejectUserRequest = async () => {
    if (!order) return;
    // UserRequest alanını None yapacak bir endpoint yoksa, PATCH ile güncellenebilir
    try {
      await apiPost(`/api/admin/order/${order.id}/user-request/reject`);
      window.location.reload();
    } catch (err) {
      alert('İşlem başarısız: ' + (err?.message || ''));
    }
  };

  return (
    <CContainer className="py-4">
      <CCard className="mb-4">
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={8}><CCardTitle className="fs-4">Sipariş #{order.id}</CCardTitle></CCol>
            <CCol md={4} className="text-md-end">
              {statusBadge(order.statusText)}
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>Kullanıcı Email:</b> {order.userEmail}</CCol>
            <CCol md={6}><b>Sipariş Tarihi:</b> {new Date(order.orderDate).toLocaleString('tr-TR')}</CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>Kullanıcı İsteği:</b> {order.userRequestText}</CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}>
              <b>Teslimat Adresi:</b>
              <div className="ms-2">
                <div><b>Başlık:</b> {order.address?.addressTitle}</div>
                <div><b>Sokak:</b> {order.address?.street}</div>
                <div><b>Şehir:</b> {order.address?.city} / {order.address?.state}</div>
                <div><b>Ülke:</b> {order.address?.country}</div>
                <div><b>Posta Kodu:</b> {order.address?.postalCode}</div>
                <div><b>İletişim:</b> {order.address?.contactName} {order.address?.contactSurname} ({order.address?.contactPhone})</div>
              </div>
            </CCol>
            <CCol md={6}>
              <b>Teslim Alacak Kişi:</b> {order.deliveryPersonName}<br/>
              <b>Telefon:</b> {order.deliveryPersonPhone}
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>Kargo Firması:</b> {order.shippingCompanyName || '-'}</CCol>
            <CCol md={6}><b>Kargo Ücreti:</b> {order.shippingCost === 0 ? 'Ücretsiz' : `${order.shippingCost}₺`}</CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>Ödeme Yöntemi:</b> {order.paymentMethod === 0 ? 'Kredi Kartı' : order.paymentMethod === 1 ? 'Banka Kartı' : order.paymentMethod === 2 ? 'Banka Havalesi' : 'Nakit'}</CCol>
            <CCol md={6}><b>Admin Durumu:</b> {order.adminStatus}</CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>Sipariş Notu:</b> {order.note || '-'}</CCol>
            <CCol md={6}><b>Toplam Tutar:</b> {order.totalAmount} ₺</CCol>
          </CRow>
          <hr />
          <h5 className="mb-3">Ürünler</h5>
          <CTable hover responsive bordered align="middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Görsel</CTableHeaderCell>
                <CTableHeaderCell>Ürün</CTableHeaderCell>
                <CTableHeaderCell>Açıklama</CTableHeaderCell>
                <CTableHeaderCell>Kategori</CTableHeaderCell>
                <CTableHeaderCell>Adet</CTableHeaderCell>
                <CTableHeaderCell>Birim Fiyat</CTableHeaderCell>
                <CTableHeaderCell>Toplam</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {order.orderItems && order.orderItems.length > 0 ? order.orderItems.map(item => (
                <CTableRow key={item.productId}>
                  <CTableDataCell>
                    <img src={item.productImage ? (item.productImage.startsWith('http') ? item.productImage : API_BASE + item.productImage) : '/images/default-product.jpg'} alt={item.productName} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  </CTableDataCell>
                  <CTableDataCell>{item.productName}</CTableDataCell>
                  <CTableDataCell>{item.productDescription || '-'}</CTableDataCell>
                  <CTableDataCell>{item.productCategory || '-'}</CTableDataCell>
                  <CTableDataCell>{item.quantity}</CTableDataCell>
                  <CTableDataCell>{item.unitPrice} ₺</CTableDataCell>
                  <CTableDataCell>{(item.quantity * item.unitPrice).toFixed(2)} ₺</CTableDataCell>
                </CTableRow>
              )) : (
                <CTableRow><CTableDataCell colSpan={7} className="text-center">Ürün bulunamadı.</CTableDataCell></CTableRow>
              )}
            </CTableBody>
          </CTable>
          <CRow className="mt-4">
            <CCol md={6} className="fw-bold fs-5">Ürünler Toplamı: {order.orderItems ? order.orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2) : '0.00'} ₺</CCol>
            <CCol md={6} className="fw-bold fs-5 text-end">Genel Toplam: {order.totalAmount} ₺</CCol>
          </CRow>
          {/* İptal/iade talebi ve admin onay butonları */}
          <CRow className="mt-4">
            <CCol>
              {order.userRequestText !== 'Yok' ? (
                <>
                  <CAlert color="warning" className="mb-3">Kullanıcı bu sipariş için {order.userRequestText.toLowerCase()} oluşturdu.</CAlert>
                  <CButton color="danger" className="me-2" onClick={handleApproveUserRequest}>{order.userRequestText} Onayla</CButton>
                  <CButton color="success" onClick={handleRejectUserRequest}>Reddet</CButton>
                </>
              ) : null}
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default AdminOrderDetailPage; 