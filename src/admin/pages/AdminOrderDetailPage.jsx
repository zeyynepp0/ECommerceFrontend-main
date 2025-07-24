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
        setError('Order details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>;
  if (error) return <CAlert color="danger">{error}</CAlert>;
  if (!order) return <CAlert color="warning">Order not found.</CAlert>;

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
      'Pending Approval': 'warning',
      'Approved': 'success',
      'Preparing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger',
      'Refund Requested': 'dark',
      'Refunded': 'success',
    };
    return <CBadge color={map[statusText] || 'secondary'} className="fs-6">{statusText}</CBadge>;
  };

  const handleApproveUserRequest = async () => {
    if (!order) return;
    let endpoint = '';
    if (order.userRequestText === 'İptal Talebi') endpoint = `/api/admin/order/${order.id}/cancel/approve`;
    else if (order.userRequestText === 'İade Talebi') endpoint = `/api/admin/order/${order.id}/refund/approve`;
    else if (order.userRequestText === 'Cancel Request') endpoint = `/api/admin/order/${order.id}/cancel/approve`;
    else if (order.userRequestText === 'Refund Request') endpoint = `/api/admin/order/${order.id}/refund/approve`;
    if (!endpoint) return;
    try {
      await apiPost(endpoint);
      window.location.reload();
    } catch (err) {
      alert('Operation failed: ' + (err?.message || ''));
    }
  };
  const handleRejectUserRequest = async () => {
    if (!order) return;
    // UserRequest alanını None yapacak bir endpoint yoksa, PATCH ile güncellenebilir
    try {
      await apiPost(`/api/admin/order/${order.id}/user-request/reject`);
      window.location.reload();
    } catch (err) {
      alert('Operation failed: ' + (err?.message || ''));
    }
  };

  return (
    <CContainer className="py-4">
      <CCard className="mb-4">
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={8}><CCardTitle className="fs-4">Order #{order.id}</CCardTitle></CCol>
            <CCol md={4} className="text-md-end">
              {statusBadge(order.statusText)}
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>User Email:</b> {order.userEmail}</CCol>
            <CCol md={6}><b>Order Date:</b> {new Date(order.orderDate).toLocaleString('en-US')}</CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>User Request:</b> {order.userRequestText}</CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>Kampanya:</b> {order.campaignName ? `${order.campaignName} (${order.campaignDiscount ? '-' + order.campaignDiscount + ' TL' : ''})` : 'None'}</CCol>
            <CCol md={6}><b>Order Note:</b> {order.orderNote || 'None'}</CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}>
              <b>Delivery Address:</b>
              <div className="ms-2">
                <div><b>Title:</b> {order.address?.addressTitle}</div>
                <div><b>Street:</b> {order.address?.street}</div>
                <div><b>City:</b> {order.address?.city} / {order.address?.state}</div>
                <div><b>Country:</b> {order.address?.country}</div>
                <div><b>Postal Code:</b> {order.address?.postalCode}</div>
                <div><b>Contact:</b> {order.address?.contactName} {order.address?.contactSurname} ({order.address?.contactPhone})</div>
              </div>
            </CCol>
            <CCol md={6}>
              <b>Recipient:</b> {order.deliveryPersonName}<br/>
              <b>Phone:</b> {order.deliveryPersonPhone}
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>Shipping Company:</b> {order.shippingCompanyName || '-'}</CCol>
            <CCol md={6}><b>Shipping Cost:</b> {order.shippingCost === 0 ? 'Free' : `${order.shippingCost}₺`}</CCol>
          </CRow>
          <CRow className="mb-2">
            <CCol md={6}><b>Payment Method:</b> {order.paymentMethod === 0 ? 'Credit Card' : order.paymentMethod === 1 ? 'Debit Card' : order.paymentMethod === 2 ? 'Bank Transfer' : 'Cash'}</CCol>
            <CCol md={6}><b>Admin Status:</b> {order.adminStatus}</CCol>
          </CRow>
          <CRow className="mb-2">
            
            <CCol md={6}><b>Total Amount:</b> {order.totalAmount} ₺</CCol>
          </CRow>
          <hr />
          <h5 className="mb-3">Products</h5>
          <CTable hover responsive bordered align="middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Image</CTableHeaderCell>
                <CTableHeaderCell>Product</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Category</CTableHeaderCell>
                <CTableHeaderCell>Quantity</CTableHeaderCell>
                <CTableHeaderCell>Unit Price</CTableHeaderCell>
                <CTableHeaderCell>Total</CTableHeaderCell>
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
                <CTableRow><CTableDataCell colSpan={7} className="text-center">No products found.</CTableDataCell></CTableRow>
              )}
            </CTableBody>
          </CTable>
          <CRow className="mt-4">
            <CCol md={6} className="fw-bold fs-5">Products Total: {order.orderItems ? order.orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2) : '0.00'} ₺</CCol>
            <CCol md={6} className="fw-bold fs-5 text-end">Grand Total: {order.totalAmount} ₺</CCol>
          </CRow>
          {/* İptal/iade talebi ve admin onay butonları */}
          <CRow className="mt-4">
            <CCol>
              {order.userRequestText !== 'Yok' && order.userRequestText !== 'None' ? (
                <>
                  <CAlert color="warning" className="mb-3">The user has created a {order.userRequestText.toLowerCase()} for this order.</CAlert>
                  <CButton color="danger" className="me-2" onClick={handleApproveUserRequest}>Approve {order.userRequestText}</CButton>
                  <CButton color="success" onClick={handleRejectUserRequest}>Reject</CButton>
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