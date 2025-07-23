import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPut, apiPost, apiDelete } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CCardText, CSpinner, CAlert, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CImage, CButton, CFormInput, CFormLabel
} from '@coreui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const API_BASE = "http://localhost:5220";

// Kullanıcıdan gelen isActive değerini normalize eden yardımcı fonksiyon
function normalizeIsActive(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val === 'true' || val === 'True' || val === '1';
  if (typeof val === 'number') return val === 1;
  return true; // default aktif
}

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  // Favori ve sepet ürün detaylarını getir
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [cartProducts, setCartProducts] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [userRes, addressRes, orderRes] = await Promise.all([
          apiGet(`${API_BASE}/api/User/${id}`),
          apiGet(`${API_BASE}/api/Address/user/${id}`),
          apiGet(`${API_BASE}/api/Order/user/${id}`)
        ]);
        setUser(userRes && userRes.id ? { ...userRes, password: userRes.passwordHash || '', isActive: normalizeIsActive(userRes.isActive) } : { id, fullName: 'Bilinmiyor', email: '-', role: '-', phone: '-', isActive: true, password: '' });
        setAddresses(addressRes || []);
        setOrders(orderRes || []);
        let favs = [];
        try {
          favs = await apiGet(`${API_BASE}/api/Favorite/user/${id}`);
          setFavorites(favs || []);
        } catch { setFavorites([]); }
        // Sepet ürünlerini CartPage.jsx'deki gibi çek
        let cartArr = [];
        try {
          cartArr = await apiGet(`${API_BASE}/api/CartItem/user/${id}`);
          // Her ürün için detay çek
          if (cartArr && cartArr.length > 0) {
            const cartDetails = await Promise.all(cartArr.map(async item => {
              try {
                const prod = await apiGet(`${API_BASE}/api/Product/${item.productId}`);
                return { ...prod, ...item };
              } catch {
                return { id: item.productId, name: 'Ürün bulunamadı', imageUrl: '', price: 0, ...item };
              }
            }));
            setCartProducts(cartDetails);
          } else {
            setCartProducts([]);
          }
        } catch { setCartProducts([]); }
        // Favori ürün detayları
        if (favs && favs.length > 0) {
          const favDetails = await Promise.all(favs.map(async fav => {
            try {
              const prod = await apiGet(`${API_BASE}/api/Product/${fav.productId}`);
              return { ...prod, ...fav };
            } catch {
              return { id: fav.productId, name: 'Ürün bulunamadı', imageUrl: '', price: 0 };
            }
          }));
          setFavoriteProducts(favDetails);
        } else {
          setFavoriteProducts([]);
        }
        // Kullanıcıların tamamını çek (email/telefon benzersizliği için)
        apiGet('http://localhost:5220/api/Admin/users')
          .then(data => {
            console.log('API kullanıcı verisi:', data);
            data.forEach((u, i) => console.log(`Kullanıcı ${i}:`, u)); // <-- Her kullanıcıyı detaylı yazdırır
            setAllUsers((data || []).map(u => ({
              ...u,
              isActive:
                u.isActive === true ||
                u.isActive === 'True' ||
                u.isActive === 1 ||
                u.isActive === '1' ||
                (u.isActive === undefined || u.isActive === null ? true : false)
            })));
          })
          .catch(() => {});
      } catch (err) {
        setError('Kullanıcı verileri alınamadı.');
        setUser({ id, fullName: 'Bilinmiyor', email: '-', role: '-', phone: '-', isActive: true });
        setAddresses([]);
        setOrders([]);
        setFavorites([]);
        setCartProducts([]);
        setFavoriteProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Profil güncelleme
  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().min(2, 'Adı en az 2 karakter olmalı').required('Adı gereklidir'),
    lastName: Yup.string().min(2, 'Soyadı en az 2 karakter olmalı').required('Soyadı gereklidir'),
    email: Yup.string().email('Geçerli bir e-posta giriniz').required('E-posta gereklidir'),
    phone: Yup.string().required('Telefon gereklidir'),
  });
  const handleProfileUpdate = async (values, { setSubmitting }) => {
    setProfileError('');
    // Email ve telefon başka kullanıcıda var mı kontrol et
    const emailExists = allUsers.some(u => u.email === values.email && String(u.id) !== String(user.id));
    const phoneExists = allUsers.some(u => u.phone === values.phone && String(u.id) !== String(user.id));
    if (emailExists) {
      setProfileError('Bu e-posta başka bir kullanıcıda kayıtlı!');
      setSubmitting(false);
      return;
    }
    if (phoneExists) {
      setProfileError('Bu telefon numarası başka bir kullanıcıda kayıtlı!');
      setSubmitting(false);
      return;
    }
    try {
      // Şifre alanı boşsa eski şifreyi kullan
      const updatePayload = {
        id: Number(user.id),
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        role: (user.role === 1 || user.role === 'Admin') ? 'Admin' : 'User',
        birthDate: user.birthDate || new Date().toISOString(),
        ...(values.password
          ? { password: values.password, passwordHash: '' }
          : { passwordHash: user.password || '' }),
        isActive: normalizeIsActive(user.isActive)
      };
      await apiPut(`${API_BASE}/api/User`, updatePayload);
      setUser({ ...user, ...values, password: updatePayload.password, isActive: normalizeIsActive(updatePayload.isActive) });
      alert('Kullanıcı bilgileri güncellendi!');
    } catch {
      setProfileError('Güncelleme başarısız.');
    } finally {
      setSubmitting(false);
    }
  };

  // Adres ekle/düzenle/sil
  const handleAddressSave = async (address, isNew) => {
    try {
      if (isNew) {
        await apiPost(`${API_BASE}/api/Address`, { ...address, userId: id });
      } else {
        await apiPut(`${API_BASE}/api/Address`, { ...address, userId: id });
      }
      const refreshed = await apiGet(`${API_BASE}/api/Address/user/${id}`);
      setAddresses(refreshed);
      setEditingAddress(null);
      setAddingAddress(false);
    } catch {
      alert('Adres kaydedilemedi.');
    }
  };
  const handleAddressDelete = async (addressId) => {
    try {
      await apiDelete(`${API_BASE}/api/Address/${addressId}`);
      const refreshed = await apiGet(`${API_BASE}/api/Address/user/${id}`);
      setAddresses(refreshed);
    } catch {
      alert('Adres silinemedi.');
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>;
  if (error) return <CAlert color="danger">{error}</CAlert>;
  if (!user) return <CAlert color="warning">Kullanıcı bulunamadı.</CAlert>;

  return (
    <CContainer className="py-4">
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol xs={12} md={3} className="text-center mb-3 mb-md-0">
             {/*  <CImage src={user.avatarUrl || '/images/default-category.jpg'} alt={user.fullName} width={100} height={100} style={{ objectFit: 'cover', borderRadius: '50%' }} /> */}
              <CCardTitle className="mt-3 fs-4 fw-bold">{user.fullName}</CCardTitle>
              <CCardText className="text-muted">{user.email}</CCardText>
              <CCardText><span className="badge bg-primary">{user.role}</span></CCardText>
            </CCol>
            <CCol xs={12} md={9}>
              <CNav variant="tabs" role="tablist">
                <CNavItem>
                  <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>Profil</CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>Adresler</CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>Sepet</CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 3} onClick={() => setActiveTab(3)}>Siparişler</CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 4} onClick={() => setActiveTab(4)}>Favoriler</CNavLink>
                </CNavItem>
              </CNav>
              <CTabContent className="mt-4">
                <CTabPane visible={activeTab === 0}>
                  <CCard className="mb-3">
                    <CCardBody>
                      <CCardTitle>Profil Bilgileri</CCardTitle>
                      <div className="mb-3">
                        <b>Durum: </b>
                        {typeof user.isActive === 'boolean' ? (
                          user.isActive ? <span className="badge bg-success">Aktif</span> : <span className="badge bg-danger">Pasif</span>
                        ) : <span className="badge bg-secondary">Bilinmiyor</span>}
                        <CButton
                          size="sm"
                          color={normalizeIsActive(user.isActive) ? 'danger' : 'success'}
                          variant="outline"
                          className="ms-2"
                          onClick={async () => {
                            try {
                              await apiPut(`${API_BASE}/api/User`, { id: user.id, isActive: !normalizeIsActive(user.isActive) });
                              setUser({ ...user, isActive: !normalizeIsActive(user.isActive) });
                            } catch {
                              alert('Durum güncellenemedi.');
                            }
                          }}
                        >
                          {normalizeIsActive(user.isActive) ? 'Pasif Yap' : 'Aktif Yap'}
                        </CButton>
                      </div>
                      <Formik
                        enableReinitialize
                        initialValues={{
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          password: ''
                        }}
                        validationSchema={ProfileSchema}
                        onSubmit={handleProfileUpdate}
                      >
                        {({ isSubmitting, values, handleChange }) => (
                          <Form>
                            {profileError && <div className="text-danger mb-2">{profileError}</div>}
                            <CRow className="mb-3">
                              <CCol md={6}>
                                <CFormLabel>Ad</CFormLabel>
                                <Field as={CFormInput} name="firstName" value={values.firstName} onChange={handleChange} />
                                <ErrorMessage name="firstName" component="div" className="text-danger small" />
                              </CCol>
                              <CCol md={6}>
                                <CFormLabel>Soyad</CFormLabel>
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
                                <CFormLabel>Telefon</CFormLabel>
                                <Field as={CFormInput} name="phone" type="tel" value={values.phone} onChange={handleChange} />
                                <ErrorMessage name="phone" component="div" className="text-danger small" />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
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
                            <CButton type="submit" color="primary" disabled={isSubmitting}>
                              {isSubmitting ? 'Kaydediliyor...' : 'Bilgilerimi Güncelle'}
                            </CButton>
                          </Form>
                        )}
                      </Formik>
                    </CCardBody>
                  </CCard>
                </CTabPane>
                <CTabPane visible={activeTab === 1}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <CCardTitle>Adresler</CCardTitle>
                    <CButton color="success" variant="outline" onClick={() => { setAddingAddress(true); setEditingAddress(null); }}>Yeni Adres</CButton>
                  </div>
                  <CRow className="g-3">
                    {addresses.map(addr => (
                      <CCol xs={12} md={6} lg={4} key={addr.id}>
                        <CCard className="h-100 shadow-sm">
                          <CCardBody>
                            <CCardTitle>{addr.addressTitle || 'Adres Başlığı'}</CCardTitle>
                            <div><b>Ad Soyad:</b> {addr.contactName} {addr.contactSurname}</div>
                            <div><b>Telefon:</b> {addr.contactPhone}</div>
                            <div><b>Şehir:</b> {addr.city}</div>
                            <div><b>İlçe:</b> {addr.state}</div>
                            <div><b>Sokak:</b> {addr.street}</div>
                            <div><b>Posta Kodu:</b> {addr.postalCode}</div>
                            <div><b>Ülke:</b> {addr.country}</div>
                            <div className="d-flex gap-2 mt-2">
                              <CButton color="primary" size="sm" variant="outline" onClick={() => { setEditingAddress(addr); setAddingAddress(false); }}>Düzenle</CButton>
                              <CButton color="danger" size="sm" variant="outline" onClick={() => handleAddressDelete(addr.id)}>Sil</CButton>
                            </div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    ))}
                  </CRow>
                  {/* Adres ekle/düzenle formu */}
                  {(editingAddress || addingAddress) && (
                    <CCard className="mt-4">
                      <CCardBody>
                        <CCardTitle>{addingAddress ? 'Yeni Adres Ekle' : 'Adresi Düzenle'}</CCardTitle>
                        <Formik
                          enableReinitialize
                          initialValues={editingAddress || {
                            addressTitle: '', street: '', city: '', state: '', postalCode: '', country: '', contactName: '', contactSurname: '', contactPhone: ''
                          }}
                          onSubmit={values => handleAddressSave(values, addingAddress)}
                        >
                          {({ isSubmitting, values, handleChange }) => (
                            <Form>
                              <CRow className="mb-3">
                                <CCol md={6}>
                                  <CFormLabel>Adres Başlığı</CFormLabel>
                                  <Field as={CFormInput} name="addressTitle" value={values.addressTitle} onChange={handleChange} />
                                </CCol>
                                <CCol md={6}>
                                  <CFormLabel>Şehir</CFormLabel>
                                  <Field as={CFormInput} name="city" value={values.city} onChange={handleChange} />
                                </CCol>
                              </CRow>
                              <CRow className="mb-3">
                                <CCol md={6}>
                                  <CFormLabel>Sokak</CFormLabel>
                                  <Field as={CFormInput} name="street" value={values.street} onChange={handleChange} />
                                </CCol>
                                <CCol md={6}>
                                  <CFormLabel>İlçe</CFormLabel>
                                  <Field as={CFormInput} name="state" value={values.state} onChange={handleChange} />
                                </CCol>
                              </CRow>
                              <CRow className="mb-3">
                                <CCol md={6}>
                                  <CFormLabel>Posta Kodu</CFormLabel>
                                  <Field as={CFormInput} name="postalCode" value={values.postalCode} onChange={handleChange} />
                                </CCol>
                                <CCol md={6}>
                                  <CFormLabel>Ülke</CFormLabel>
                                  <Field as={CFormInput} name="country" value={values.country} onChange={handleChange} />
                                </CCol>
                              </CRow>
                              <CRow className="mb-3">
                                <CCol md={6}>
                                  <CFormLabel>İletişim Adı</CFormLabel>
                                  <Field as={CFormInput} name="contactName" value={values.contactName} onChange={handleChange} />
                                </CCol>
                                <CCol md={6}>
                                  <CFormLabel>İletişim Soyadı</CFormLabel>
                                  <Field as={CFormInput} name="contactSurname" value={values.contactSurname} onChange={handleChange} />
                                </CCol>
                              </CRow>
                              <CRow className="mb-3">
                                <CCol md={6}>
                                  <CFormLabel>İletişim Telefonu</CFormLabel>
                                  <Field as={CFormInput} name="contactPhone" value={values.contactPhone} onChange={handleChange} />
                                </CCol>
                              </CRow>
                              <div className="d-flex gap-2">
                                <CButton type="submit" color="primary" disabled={isSubmitting}>{isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</CButton>
                                <CButton type="button" color="secondary" variant="outline" onClick={() => { setEditingAddress(null); setAddingAddress(false); }}>İptal</CButton>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      </CCardBody>
                    </CCard>
                  )}
                </CTabPane>
                <CTabPane visible={activeTab === 2}>
                  {cartProducts.length === 0 ? <div className="text-muted">Sepet boş.</div> : (
                    <CRow className="g-3">
                      {cartProducts.map(item => (
                        <CCol xs={12} md={6} lg={4} key={item.id}>
                          <CCard className="h-100 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${item.productId || item.id}`)}>
                            <CImage src={item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : API_BASE + item.imageUrl) : '/images/default-product.jpg'} alt={item.name} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                            <CCardBody>
                              <CCardTitle>{item.name}</CCardTitle>
                              <div><b>Adet:</b> {item.quantity}</div>
                              <div><b>Fiyat:</b> {item.price} ₺</div>
                              {item.category && <div><b>Kategori:</b> {item.category.name}</div>}
                              {item.stock !== undefined && <div><b>Stok:</b> {item.stock}</div>}
                              {item.description && <div><b>Açıklama:</b> {item.description}</div>}
                            </CCardBody>
                          </CCard>
                        </CCol>
                      ))}
                    </CRow>
                  )}
                </CTabPane>
                <CTabPane visible={activeTab === 3}>
                  {orders.length === 0 ? <div className="text-muted">Sipariş bulunamadı.</div> : (
                    <CTable hover responsive bordered align="middle">
                      <CTableHead color="light">
                        <CTableRow>
                          <CTableHeaderCell>ID</CTableHeaderCell>
                          <CTableHeaderCell>Tarih</CTableHeaderCell>
                          <CTableHeaderCell>Tutar</CTableHeaderCell>
                          <CTableHeaderCell>Durum</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {orders.map(order => (
                          <CTableRow key={order.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${order.id}`)}>
                            <CTableDataCell>{order.id}</CTableDataCell>
                            <CTableDataCell>{order.orderDate}</CTableDataCell>
                            <CTableDataCell>{order.totalAmount} ₺</CTableDataCell>
                            <CTableDataCell>{order.status}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>
                <CTabPane visible={activeTab === 4}>
                  {favoriteProducts.length === 0 ? <div className="text-muted">Favori ürün yok.</div> : (
                    <CRow className="g-3">
                      {favoriteProducts.map(fav => (
                        <CCol xs={12} md={6} lg={4} key={fav.id}>
                          <CCard className="h-100 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${fav.productId || fav.id}`)}>
                            <CImage src={fav.imageUrl ? (fav.imageUrl.startsWith('http') ? fav.imageUrl : API_BASE + fav.imageUrl) : '/images/default-product.jpg'} alt={fav.name} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                            <CCardBody>
                              <CCardTitle>{fav.name}</CCardTitle>
                              <div><b>Fiyat:</b> {fav.price} ₺</div>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      ))}
                    </CRow>
                  )}
                </CTabPane>
              </CTabContent>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default AdminUserDetailPage; 