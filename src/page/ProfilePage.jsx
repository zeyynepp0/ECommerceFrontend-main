import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFavorites, removeFavorite } from '../store/favoriteSlice';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CFormInput, CFormLabel, CForm, CListGroup, CListGroupItem, CAvatar, CBadge, CAlert, CSpinner, CPagination, CPaginationItem, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
} from '@coreui/react';
import { FiUser, FiMapPin, FiHeart, FiShoppingBag, FiPlus, FiTrash2, FiEdit2, FiMail, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    default:
      return <CBadge color="secondary">None</CBadge>;
  }
};

const ProfilePage = () => {
  const { userId, isLoggedIn } = useSelector(state => state.user);
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const userIdFromContext = userId || routeUserId;
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');
  const { favorites: contextFavorites } = useSelector(state => state.favorite);
  const dispatch = useDispatch();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const API_BASE = "http://localhost:5220";

  const FAVORITES_PAGE_SIZE = 8;
  const ADDRESSES_PAGE_SIZE = 8;

  const [favoritesPage, setFavoritesPage] = useState(1);
  const [addressesPage, setAddressesPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !userIdFromContext) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [userRes, addressRes, orderRes] = await Promise.all([
          apiGet(`http://localhost:5220/api/User/${userIdFromContext}`),
          apiGet(`http://localhost:5220/api/Address/user/${userIdFromContext}`),
          apiGet(`http://localhost:5220/api/Order/user/${userIdFromContext}`)
        ]);
        setUser({
          ...userRes,
          password: userRes.passwordHash || '',
          birthDate: userRes.birthDate || ''
        });
        setAddresses(addressRes);
        setOrders(orderRes);
        setLoading(false);
        dispatch(fetchFavorites());
      } catch (error) {
        console.error('Profil verileri alınamadı:', error);
        navigate('/login');
      }
    };
    fetchData();
  }, [userIdFromContext, navigate, dispatch]);

  useEffect(() => {
    setActiveTab(tabFromUrl || 'profile');
  }, [tabFromUrl]);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (!contextFavorites || contextFavorites.length === 0) {
        setFavoriteProducts([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const productDetails = await Promise.all(
          contextFavorites.map(async fav => {
            const res = await axios.get(`http://localhost:5220/api/Product/${fav.productId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return {
              ...res.data,
              imageUrl: res.data.imageUrl ? (res.data.imageUrl.startsWith('http') ? res.data.imageUrl : API_BASE + res.data.imageUrl) : '/images/default-product.jpg'
            };
          })
        );
        setFavoriteProducts(productDetails);
      } catch (err) {
        setFavoriteProducts([]);
      }
    };
    fetchFavoriteProducts();
  }, [contextFavorites]);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveUser = async () => {
    try {
      await axios.put(`http://localhost:5220/api/User`, user, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Kullanıcı bilgileri güncellendi!');
    } catch (error) {
      alert('Güncelleme başarısız.');
    }
  };

  const handleAddressChange = (index, field, value) => {
    const updated = [...addresses];
    updated[index][field] = value;
    setAddresses(updated);
  };

  const saveAddress = async (address) => {
    const sanitizedAddress = {
      ...address,
      id: address.id?.toString().startsWith('temp') ? 0 : parseInt(address.id),
      userId: parseInt(address.userId),
    };
    try {
      if (address.id?.toString().startsWith('temp')) {
        await apiPost(`http://localhost:5220/api/Address`, sanitizedAddress);
      } else {
        await apiPut(`http://localhost:5220/api/Address`, sanitizedAddress);
      }
      const refreshed = await apiGet(`http://localhost:5220/api/Address/user/${userIdFromContext}`);
      setAddresses(refreshed);
    } catch (err) {
      alert('Adres kaydedilemedi. ' + err);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await apiDelete(`http://localhost:5220/api/Address/${id}`);
      const refreshed = await apiGet(`http://localhost:5220/api/Address/user/${userIdFromContext}`);
      setAddresses(refreshed);
    } catch (err) {
      alert('Adres silinemedi. ' + err);
    }
  };

  const addEmptyAddress = () => {
    setAddresses([
      ...addresses,
      {
        id: `temp-${Date.now()}`,
        addressTitle: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        contactName: '',
        contactSurname: '',
        contactPhone: '',
        userId: userIdFromContext,
      },
    ]);
  };

  const handleRemoveFavorite = (productId) => {
    dispatch(removeFavorite(productId));
  };

  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
    lastName: Yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
    email: Yup.string().email('Please enter a valid email address').required('Email is required'),
    phone: Yup.string()
      .matches(/^(\t0|0)?\d{10}$/, 'Invalid phone number. Enter 10 digits without leading 0 or +90.')
      .required('Phone number is required'),
  });

  if (loading) return (
    <CContainer className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <CSpinner color="primary" />
    </CContainer>
  );

  // Favorilerde sayfalama
  const totalFavoritesPages = Math.ceil(favoriteProducts.length / FAVORITES_PAGE_SIZE);
  const paginatedFavorites = favoriteProducts.slice((favoritesPage - 1) * FAVORITES_PAGE_SIZE, favoritesPage * FAVORITES_PAGE_SIZE);
  // Adreslerde sayfalama
  const totalAddressesPages = Math.ceil(addresses.length / ADDRESSES_PAGE_SIZE);
  const paginatedAddresses = addresses.slice((addressesPage - 1) * ADDRESSES_PAGE_SIZE, addressesPage * ADDRESSES_PAGE_SIZE);

  // Sipariş durumunu yazı ve renkli badge ile gösteren yardımcı fonksiyon
  const getOrderStatusBadge = (statusText) => {
    const map = {
      'Onay Bekliyor': { color: 'warning', text: 'Pending Approval' },
      'Onaylandı': { color: 'success', text: 'Approved' },
      'Hazırlanıyor': { color: 'info', text: 'Preparing' },
      'Kargoya Verildi': { color: 'primary', text: 'Shipped' },
      'Teslim Edildi': { color: 'success', text: 'Delivered' },
      'İptal Edildi': { color: 'danger', text: 'Cancelled' },
      'İade Talebi': { color: 'dark', text: 'Return Requested' },
      'İade Edildi': { color: 'success', text: 'Returned' },
    };
    const s = map[statusText] || { color: 'secondary', text: statusText };
    return <CBadge color={s.color} className="ms-2">{s.text}</CBadge>;
  };
  // Sipariş aksiyonları
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await apiPost(`http://localhost:5220/api/Order/${orderId}/cancel`);
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      alert('Your cancellation request has been submitted. The admin will confirm and cancel it.');
    } catch (err) {
      alert('Order cancellation failed. ' + (err?.response?.data?.message || err?.message || ''));
    }
  };
  const handleReturnOrder = async (orderId) => {
    console.log('Return Order clicked', orderId);
    if (!window.confirm('Are you sure you want to return this order?')) return;
    try {
      await apiPost(`http://localhost:5220/api/Order/${orderId}/return`);
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'Returned' } : o));
      alert('Your return request has been submitted. The admin will confirm and start the process.');
    } catch (err) {
      alert('Order return failed. ' + (err?.response?.data?.message || err?.message || ''));
    }
  };
  const handleTrackOrder = (orderId) => {
    window.open(`/kargo-takip/${orderId}`, '_blank');
  };

  return (
    <CContainer fluid className="py-4" style={{ background: '#fff', color: '#333' }}>
      <CRow>
        {/* Sidebar */}
        <CCol xs={12} md={4} lg={3} className="mb-4">
          <CCard className="mb-3 text-center p-3" style={{ background: '#fff', color: '#333', border: '1px solid #eee' }}>
           {/*  <CAvatar color="primary" size="xl" className="mb-2" style={{ fontSize: 36, background: '#e0e0e0', color: '#222222' }}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </CAvatar> */}
            <h4 className="mb-1">{user?.firstName} {user?.lastName}</h4>
            <div className="text-muted mb-1"><FiMail className="me-1" />{user?.email}</div>
            <div className="text-muted mb-2"><FiPhone className="me-1" />{user?.phone}</div>
          </CCard>
          <CNav variant="pills" className="flex-column gap-2">
            <CNavItem>
              <CNavLink active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? { background: '#222222', color: '#fff' } : { color: '#222222' }}><FiUser className="me-2" />Profile Info</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 'address'} onClick={() => setActiveTab('address')} style={activeTab === 'address' ? { background: '#222222', color: '#fff' } : { color: '#222222' }}><FiMapPin className="me-2" />My Addresses</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} style={activeTab === 'favorites' ? { background: '#222222', color: '#fff' } : { color: '#222222' }}><FiHeart className="me-2" />My Favorites</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? { background: '#222222', color: '#fff' } : { color: '#222222' }}><FiShoppingBag className="me-2" />My Orders</CNavLink>
            </CNavItem>
          </CNav>
        </CCol>
        {/* Main Content */}
        <CCol xs={12} md={8} lg={9}>
          <CTabContent>
            <CTabPane visible={activeTab === 'profile'}>
              <CCard className="mb-4" style={{ background: '#fff', color: '#333', border: '1px solid #eee' }}>
                <CCardBody>
                  <CCardTitle>Profil Bilgileri</CCardTitle>
                  <Formik
                    enableReinitialize
                    initialValues={{
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      password: '',
                      birthDate: user.birthDate ? user.birthDate.substring(0, 10) : ''
                    }}
                    validationSchema={ProfileSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                      try {
                        const payload = {
                          id: user.id,
                          firstName: values.firstName,
                          lastName: values.lastName,
                          email: values.email,
                          phone: values.phone,
                          role: (user.role === 1 || user.role === 'Admin') ? 'Admin' : 'User',
                          birthDate: values.birthDate ? values.birthDate : null,
                          ...(values.password
                            ? { password: values.password, passwordHash: '' }
                            : { passwordHash: user.passwordHash || '' }),
                          isActive: typeof user.isActive === 'boolean' ? user.isActive : true
                        };
                        console.log('Güncelleme payload:', payload);
                        await axios.put(`http://localhost:5220/api/User`, payload, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        });
                        alert('Kullanıcı bilgileri güncellendi!');
                      } catch (error) {
                        if (error.response && error.response.data) {
                          alert('Güncelleme başarısız: ' + JSON.stringify(error.response.data));
                        } else {
                          alert('Güncelleme başarısız.');
                        }
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    {({ isSubmitting, values, handleChange }) => (
                      <Form>
                        <CRow className="mb-3">
                          <CCol md={6}>
                            <CFormLabel>First Name</CFormLabel>
                            <Field as={CFormInput} name="firstName" value={values.firstName} onChange={handleChange} />
                            <ErrorMessage name="firstName" component="div" className="text-danger small" />
                          </CCol>
                          <CCol md={6}>
                            <CFormLabel>Last Name</CFormLabel>
                            <Field as={CFormInput} name="lastName" value={values.lastName} onChange={handleChange} />
                            <ErrorMessage name="lastName" component="div" className="text-danger small" />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol md={6}>
                            <CFormLabel>Email</CFormLabel>
                            <Field as={CFormInput} name="email" type="email" value={values.email} onChange={handleChange} />
                            <ErrorMessage name="email" component="div" className="text-danger small" />
                          </CCol>
                          <CCol md={6}>
                            <CFormLabel>Phone</CFormLabel>
                            <Field as={CFormInput} name="phone" type="tel" value={values.phone} onChange={handleChange} />
                            <ErrorMessage name="phone" component="div" className="text-danger small" />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol md={6}>
                            <CFormLabel>Doğum Günü</CFormLabel>
                            <Field as={CFormInput} name="birthDate" type="date" value={values.birthDate} onChange={handleChange} />
                          </CCol>
                          <CCol md={6}>
                            <CFormLabel>Şifre (değiştirmek için doldurun)</CFormLabel>
                            <div style={{ position: 'relative' }}>
                              <Field as={CFormInput} name="password" type={showPassword ? 'text' : 'password'} value={values.password} onChange={handleChange} autoComplete="new-password" />
                              <span style={{ position: 'absolute', right: 10, top: 8, cursor: 'pointer' }} onClick={() => setShowPassword(v => !v)}>
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                              </span>
                            </div>
                          </CCol>
                        </CRow>
                        <CButton type="submit" style={{ background: '#222222', color: '#fff', border: 'none' }} disabled={isSubmitting}>
                          {isSubmitting ? 'Kaydediliyor...' : 'Bilgilerimi Güncelle'}
                        </CButton>
                      </Form>
                    )}
                  </Formik>
                </CCardBody>
              </CCard>
            </CTabPane>
            <CTabPane visible={activeTab === 'address'}>
              <CCard className="mb-4" style={{ background: '#fff', color: '#333', border: '1px solid #eee' }}>
                <CCardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <CCardTitle>Adreslerim</CCardTitle>
                    <CButton color="success" variant="outline" onClick={addEmptyAddress}><FiPlus className="me-1" />Yeni Adres</CButton>
                  </div>
                  <CListGroup>
                    {paginatedAddresses.map((addr, idx) => (
                      <CListGroupItem key={addr.id} className="mb-3">
                        <CRow>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>Adres Başlığı</CFormLabel>
                            <CFormInput value={addr.addressTitle} onChange={e => handleAddressChange(idx, 'addressTitle', e.target.value)} />
                          </CCol>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>Şehir</CFormLabel>
                            <CFormInput value={addr.city} onChange={e => handleAddressChange(idx, 'city', e.target.value)} />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>Sokak</CFormLabel>
                            <CFormInput value={addr.street} onChange={e => handleAddressChange(idx, 'street', e.target.value)} />
                          </CCol>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>İlçe</CFormLabel>
                            <CFormInput value={addr.state} onChange={e => handleAddressChange(idx, 'state', e.target.value)} />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>Posta Kodu</CFormLabel>
                            <CFormInput value={addr.postalCode} onChange={e => handleAddressChange(idx, 'postalCode', e.target.value)} />
                          </CCol>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>Ülke</CFormLabel>
                            <CFormInput value={addr.country} onChange={e => handleAddressChange(idx, 'country', e.target.value)} />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>İletişim Adı</CFormLabel>
                            <CFormInput value={addr.contactName} onChange={e => handleAddressChange(idx, 'contactName', e.target.value)} />
                          </CCol>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>İletişim Soyadı</CFormLabel>
                            <CFormInput value={addr.contactSurname} onChange={e => handleAddressChange(idx, 'contactSurname', e.target.value)} />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol md={6} className="mb-2">
                            <CFormLabel>İletişim Telefonu</CFormLabel>
                            <CFormInput value={addr.contactPhone} onChange={e => handleAddressChange(idx, 'contactPhone', e.target.value)} />
                          </CCol>
                          <CCol md={6} className="d-flex align-items-end justify-content-end gap-2">
                            <CButton color="primary" variant="outline" onClick={() => saveAddress(addr)}><FiEdit2 className="me-1" />Kaydet</CButton>
                            <CButton color="danger" variant="outline" onClick={() => deleteAddress(addr.id)}><FiTrash2 className="me-1" />Sil</CButton>
                          </CCol>
                        </CRow>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                  {totalAddressesPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                      <CPagination align="center">
                        {[...Array(totalAddressesPages)].map((_, idx) => (
                          <CPaginationItem
                            key={idx + 1}
                            active={addressesPage === idx + 1}
                            onClick={() => setAddressesPage(idx + 1)}
                            style={{ cursor: 'pointer' }}
                          >
                            {idx + 1}
                          </CPaginationItem>
                        ))}
                      </CPagination>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CTabPane>
            <CTabPane visible={activeTab === 'favorites'}>
              <CCard className="mb-4" style={{ background: '#fff', color: '#333', border: '1px solid #eee' }}>
                <CCardBody>
                  <CCardTitle>Favorilerim</CCardTitle>
                  {favoriteProducts.length === 0 ? (
                    <CAlert color="info" className="text-center my-4">Henüz favori ürününüz bulunmamaktadır.</CAlert>
                  ) : (
                    <>
                      <CRow className="g-3">
                        {paginatedFavorites.map(product => (
                          <CCol xs={12} sm={6} md={4} lg={3} key={product.id}>
                            <CCard className="h-100" style={{ cursor: 'pointer', background: '#fff', color: '#333', border: '1px solid #eee' }} onClick={() => navigate(`/products/${product.id}`)}>
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{ width: '100%', height: 140, objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8, background: '#fff' }}
                                onError={e => { e.target.src = '/images/default-product.jpg'; }}
                              />
                              <CCardBody>
                                <CCardTitle>{product.name}</CCardTitle>
                                <CCardText>{product.description}</CCardText>
                                <div className="mb-2">Price: <strong>{product.price} TL</strong></div>
                                <div className="mb-2">Stock: <strong>{product.stock}</strong></div>
                                <div className="mb-2">Category: <strong>{product.category?.name}</strong></div>
                                <CButton color="danger" variant="outline" size="sm" onClick={e => { e.stopPropagation(); handleRemoveFavorite(product.id); }}><FiTrash2 className="me-1" />Remove from Favorites</CButton>
                              </CCardBody>
                            </CCard>
                          </CCol>
                        ))}
                      </CRow>
                      {totalFavoritesPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                          <CPagination align="center">
                            {[...Array(totalFavoritesPages)].map((_, idx) => (
                              <CPaginationItem
                                key={idx + 1}
                                active={favoritesPage === idx + 1}
                                onClick={() => setFavoritesPage(idx + 1)}
                                style={{ cursor: 'pointer' }}
                              >
                                {idx + 1}
                              </CPaginationItem>
                            ))}
                          </CPagination>
                        </div>
                      )}
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CTabPane>
            <CTabPane visible={activeTab === 'orders'}>
              <CCard className="mb-4" style={{ background: '#fff', color: '#333', border: '1px solid #eee' }}>
                <CCardBody>
                  <CCardTitle>Siparişlerim</CCardTitle>
                  {orders.length === 0 ? (
                    <CAlert color="info" className="text-center my-4">Henüz siparişiniz bulunmamaktadır.</CAlert>
                  ) : (
                    <CListGroup>
                      {orders.map(order => {
                        // Durumları hem sayı, hem string, hem Türkçe olarak kontrol et
                        const isCancelled = order.status === 5 || order.status === 'Cancelled' || order.status === '5' || order.statusText === 'İptal Edildi';
                        const isRefunded = order.status === 7 || order.status === 'Refunded' || order.status === '7' || order.statusText === 'İade Edildi';
                        const isDelivered = order.status === 4 || order.status === 'Delivered' || order.status === '4' || (order.statusText && order.statusText.toLowerCase() === 'teslim edildi') || String(order.status).toLowerCase() === 'delivered';
                        return (
                          <CListGroupItem
                            key={order.id}
                            className={`mb-3 ${isCancelled ? 'list-group-item-danger' : isRefunded ? 'list-group-item-warning' : ''}${isDelivered ? 'list-group-item-success' : ''}`}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div>
                                <span className="fw-bold">Order No: #{order.id}</span>
                                {getOrderStatusBadge(order.statusText)}
                              </div>
                              <div className="text-muted">{new Date(order.orderDate).toLocaleDateString()}</div>
                            </div>
                            <div className="mb-2"><strong>Address:</strong> {order.address?.addressTitle} - {order.address?.street}, {order.address?.city} {order.address?.state}, {order.address?.country} ({order.address?.postalCode})</div>
                            <div className="mb-2"><strong>Delivery Person:</strong> {order.deliveryPersonName} <strong>Phone:</strong> {order.deliveryPersonPhone}</div>
                            <div className="mb-2"><strong>Payment Method:</strong> {order.paymentMethod === 0 ? 'Credit Card' : order.paymentMethod === 1 ? 'Bank Card' : order.paymentMethod === 2 ? 'Bank Transfer' : 'Cash'}</div>
                            <div className="mb-2"><strong>Shipping Cost:</strong> {order.shippingCost === 0 ? 'Free' : `${order.shippingCost} TL`}</div>
                            <div className="mb-2"><strong>Total Amount:</strong> {order.totalAmount} TL</div>
                            <div className="mb-2"><strong>Order Items:</strong></div>
                            <CListGroup className="mb-2">
                              {order.orderItems?.map(item => (
                                <CListGroupItem key={item.id} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${item.productId}`)}>
                                  <img src={item.productImage ? (item.productImage.startsWith('http') ? item.productImage : API_BASE + item.productImage) : '/images/default-product.jpg'} alt={item.productName} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                                  <div className="flex-grow-1">
                                    <div className="fw-bold">{item.productName}</div>
                                    <div className="text-muted">{item.quantity} × {item.unitPrice} TL</div>
                                  </div>
                                  <div className="fw-bold">{(item.quantity * item.unitPrice).toFixed(2)} TL</div>
                                </CListGroupItem>
                              ))}
                            </CListGroup>
                            {/* Sipariş aksiyon butonları */}
                            <div className="d-flex gap-2 mt-2">
                              <CButton color="danger" size="sm" variant="outline" disabled={['Cancelled','Returned','Delivered','Refunded',5,7,4,'5','7','4'].includes(order.status) || isCancelled || isRefunded} onClick={() => handleCancelOrder(order.id)}>Cancel Order</CButton>
                              <CButton 
                                color="warning" 
                                size="sm" 
                                variant="outline" 
                                disabled={!isDelivered} 
                                onClick={() => handleReturnOrder(order.id)}
                              >
                                Return Order
                              </CButton>
                              <CButton color="info" size="sm" variant="outline" onClick={() => handleTrackOrder(order.id)}>Track Shipping</CButton>
                            </div>
                          </CListGroupItem>
                        );
                      })}
                    </CListGroup>
                  )}
                </CCardBody>
              </CCard>
            </CTabPane>
          </CTabContent>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ProfilePage;