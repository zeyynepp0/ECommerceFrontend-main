import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCartFromBackend, addToCart, removeFromCart, updateQuantity, clearCart, selectCartTotal } from '../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { apiDelete, apiPost, parseApiError } from '../utils/api';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CButton, CSpinner, CAlert, CBadge } from '@coreui/react';


const API_BASE = "http://localhost:5220";

const CartPage = ({ darkMode }) => {
  const { userId, isLoggedIn } = useSelector(state => state.user);
  const { cartItems, status } = useSelector(state => state.cart);
  const cartTotal = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && userId) {
      dispatch(fetchCartFromBackend(userId));
    }
  }, [isLoggedIn, userId, dispatch]);

  // Ürün miktarını güncelleme fonksiyonu
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;
    const stock = typeof item.stock === 'number' ? item.stock : 99;
    if (newQuantity < 1) return;
    if (newQuantity > stock) {
      alert(`Stok yetersiz! Bu üründen maksimum ${stock} adet ekleyebilirsiniz.`);
      return;
    }
    try {
      await apiDelete(`http://localhost:5220/api/CartItem/${itemId}`);
      if (newQuantity > 0) {
        await apiPost('http://localhost:5220/api/CartItem', {
          userId: userId,
          productId: item.productId,
          quantity: newQuantity
        });
      }
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('Miktar güncellenirken hata oluştu! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Sepetten ürün çıkarma fonksiyonu
  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await apiDelete(`http://localhost:5220/api/CartItem/${cartItemId}`);
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('Ürün kaldırılırken hata oluştu! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Sepeti temizleme fonksiyonu
  const handleClearCart = async () => {
    dispatch(clearCart());
    try {
      await apiDelete(`http://localhost:5220/api/CartItem/user/${userId}`);
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('Sepet temizlenirken hata oluştu! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Alışverişi tamamlama fonksiyonu
  const handleCheckout = () => {
    if (!isLoggedIn || !userId) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }
    // Sepeti backend'den tekrar çekip güncel olup olmadığını kontrol et
    dispatch(fetchCartFromBackend(userId)).then(() => {
      if (cartItems.length === 0) {
        alert('Sepetiniz boş!');
        return;
      }
      navigate('/checkout'); // Sadece /checkout route'u kullanılmalı
    });
  };

  // Kargo ücreti ve toplam hesaplama (checkout ile uyumlu)
  const [shippingCompanies, setShippingCompanies] = React.useState([]);
  const [selectedShipping, setSelectedShipping] = React.useState('');
  const [shippingCost, setShippingCost] = React.useState(0);

  useEffect(() => {
    if (isLoggedIn && userId) {
      // apiGet('/api/ShippingCompany/active').then(res => { // This line was commented out in the original file, so it's not added here.
      //   setShippingCompanies(res);
      //   setSelectedShipping(res[0]?.id || '');
      // });
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    const cartTotal = cartItems.reduce((sum, item) => (sum + (item.price || 0) * (item.quantity || 1)), 0);
    const selectedShippingObj = shippingCompanies.find(s => s.id === Number(selectedShipping));
    const cost = selectedShippingObj ? (cartTotal > selectedShippingObj.freeShippingLimit ? 0 : selectedShippingObj.price) : 0;
    setShippingCost(cost);
  }, [cartItems, shippingCompanies, selectedShipping]);

  if (status === 'loading') {
    return (
      <CContainer className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <CSpinner color="primary" />
      </CContainer>
    );
  }

  if (!isLoggedIn || !userId) {
    return (
      <CContainer className="py-5">
        <CAlert color="warning">
          Sepetinizi görüntülemek için giriş yapmalısınız. <CButton color="link" as={Link} to="/login">Giriş Yap</CButton>
        </CAlert>
      </CContainer>
    );
  }

  return (
    <CContainer className="py-4">
      <CCard className="mb-4">
        <CCardBody>
          <CCardTitle as="h2">Sepetim</CCardTitle>
          {cartItems.length === 0 ? (
            <CAlert color="info">
              Sepetiniz boş. <CButton color="link" as={Link} to="/">Alışverişe Devam Et</CButton>
            </CAlert>
          ) : (
            <CRow>
              <CCol md={8}>
                {cartItems.map(item => {
                  const stock = typeof item.stock === 'number' ? item.stock : 0;
                  const currentQuantity = item.quantity || 1;
                  const itemTotal = (item.price || 0) * currentQuantity;
                  return (
                    <CCard key={item.id} className="mb-3">
                      <CCardBody className="d-flex align-items-center gap-3">
                        <img
                          src={item.image ? (item.image.startsWith('http') ? item.image : API_BASE + item.image) : '/images/default-product.jpg'}
                          alt={item.name || 'Ürün'}
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${item.productId}`)}
                          onError={e => { e.target.src = '/images/default-product.jpg'; }}
                        />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }} onClick={() => navigate(`/products/${item.productId}`)}>{item.name || 'Ürün İsmi Yok'}</h5>
                          {item.categoryName && (
                            <div className="mb-2">
                              <CBadge color="info">{item.categoryName}</CBadge>
                            </div>
                          )}
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <CButton size="sm" color="secondary" variant="outline" onClick={() => handleUpdateQuantity(item.id, currentQuantity - 1)} disabled={currentQuantity <= 1}>-</CButton>
                            <span>{currentQuantity}</span>
                            <CButton size="sm" color="secondary" variant="outline" onClick={() => handleUpdateQuantity(item.id, currentQuantity + 1)} disabled={currentQuantity >= stock}>+</CButton>
                          </div>
                          <div className="mb-2">Birim Fiyat: <strong>{(item.price || 0).toFixed(2)}₺</strong></div>
                          <div className="mb-2">Toplam: <strong>{itemTotal.toFixed(2)}₺</strong></div>
                          <CButton size="sm" color="danger" variant="outline" onClick={() => handleRemoveFromCart(item.id)}>Kaldır</CButton>
                        </div>
                      </CCardBody>
                    </CCard>
                  );
                })}
              </CCol>
              <CCol md={4}>
                <CCard className="mb-3">
                  <CCardBody>
                    <CCardTitle as="h4">Sipariş Özeti</CCardTitle>
                    <div className="mb-2 d-flex justify-content-between">
                      <span>Ara Toplam:</span>
                      <span>{cartTotal.toFixed(2)}₺</span>
                    </div>
                    <div className="mb-2 d-flex justify-content-between">
                      <span>Kargo:</span>
                      {shippingCompanies.length > 0 ? (
                        <>
                          <select value={selectedShipping} onChange={e => setSelectedShipping(e.target.value)} style={{ marginRight: 8 }}>
                            {shippingCompanies.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.price}₺)</option>
                            ))}
                          </select>
                          <span>{shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toFixed(2)}₺`}</span>
                        </>
                      ) : (
                        <span>Kargo ücreti, ödeme adımında seçtiğiniz kargo firmasına göre eklenecektir.</span>
                      )}
                    </div>
                    <div className="mb-3 d-flex justify-content-between fw-bold">
                      <span>Toplam:</span>
                      <span>{(cartTotal + shippingCost).toFixed(2)}₺</span>
                    </div>
                    <CButton color="danger" variant="outline" className="w-100 mb-2" onClick={handleClearCart}>Sepeti Temizle</CButton>
                    <CButton color="secondary" variant="outline" className="w-100 mb-2" as={Link} to="/">Alışverişe Devam Et</CButton>
                    <CButton color="success" className="w-100" onClick={handleCheckout}>Alışverişi Tamamla</CButton>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default CartPage; 