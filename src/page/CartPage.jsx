// Sepet sayfası - Kullanıcı sepetini, kampanya ve toplam hesaplamalarını yönetir
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCartFromBackend, addToCart, removeFromCart, updateQuantity, clearCart, selectCartTotal } from '../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { apiDelete, apiPost, parseApiError, apiGet } from '../utils/api';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CButton, CSpinner, CAlert, CBadge } from '@coreui/react';

const API_BASE = "https://localhost:7098";

const CartPage = () => {
  // Kullanıcı ve sepet state'leri
  const { userId, isLoggedIn } = useSelector(state => state.user); // Kullanıcı bilgisi
  const { cartItems, status } = useSelector(state => state.cart); // Sepet ürünleri ve durum
  const cartTotal = useSelector(selectCartTotal); // Sepet toplamı
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Kampanya ve indirim state'leri
  const [availableCampaigns, setAvailableCampaigns] = useState([]); // Uygun kampanyalar
  const [selectedCampaignId, setSelectedCampaignId] = useState(null); // Seçili kampanya
  const [campaignDiscount, setCampaignDiscount] = useState(0); // Kampanya indirimi
  const [discountedTotal, setDiscountedTotal] = useState(cartTotal); // İndirimli toplam

  // Kullanıcı giriş yaptıysa sepeti backend'den çek
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
      alert(`Insufficient stock! You can add up to ${stock} of this product.`);
      return;
    }
    try {
      await apiDelete(`https://localhost:7098/api/CartItem/${itemId}`);
      if (newQuantity > 0) {
        await apiPost('https://localhost:7098/api/CartItem', {
          userId: userId,
          productId: item.productId,
          quantity: newQuantity
        });
      }
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('An error occurred while updating the quantity! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Sepetten ürün çıkarma fonksiyonu
  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await apiDelete(`https://localhost:7098/api/CartItem/${cartItemId}`);
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('An error occurred while removing the product! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Sepeti temizleme fonksiyonu
  const handleClearCart = async () => {
    dispatch(clearCart());
    try {
      await apiDelete(`https://localhost:7098/api/CartItem/user/${userId}`);
      await dispatch(fetchCartFromBackend(userId));
    } catch (error) {
      alert('An error occurred while clearing the cart! ' + parseApiError(error));
      await dispatch(fetchCartFromBackend(userId));
    }
  };

  // Kampanyaları çek
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const allCampaigns = await apiGet('/api/campaign');
        // Sepetteki ürün/kategori ile eşleşen aktif kampanyaları filtrele
        const productIds = cartItems.map(i => i.productId || i.id);
        const categoryIds = cartItems.map(i => i.categoryId).filter(Boolean);
        const now = new Date();
        const validCampaigns = allCampaigns.filter(c => {
          if (!c.isActive) return false;
          if (c.startDate && new Date(c.startDate) > now) return false;
          if (c.endDate && new Date(c.endDate) < now) return false;
          // Ürün veya kategori eşleşmesi
          const hasProduct = c.productIds?.some(pid => productIds.includes(pid));
          const hasCategory = c.categoryIds?.some(cid => categoryIds.includes(cid));
          return hasProduct || hasCategory;
        });
        setAvailableCampaigns(validCampaigns);
      } catch (e) {
        setAvailableCampaigns([]);
      }
    };
    if (cartItems.length > 0) fetchCampaigns();
  }, [cartItems]);

  // Kampanya seçilince indirim hesapla
  useEffect(() => {
    if (!selectedCampaignId) {
      setCampaignDiscount(0);
      setDiscountedTotal(cartTotal);
      return;
    }
    const campaign = availableCampaigns.find(c => c.id === Number(selectedCampaignId));
    if (!campaign) {
      setCampaignDiscount(0);
      setDiscountedTotal(cartTotal);
      return;
    }
    // Sepette kampanyaya dahil ürünleri bul
    const productIds = cartItems.map(i => i.productId || i.id);
    const categoryIds = cartItems.map(i => i.categoryId).filter(Boolean);
    const includedItems = cartItems.filter(item =>
      (campaign.productIds?.includes(item.productId || item.id)) ||
      (campaign.categoryIds?.includes(item.categoryId))
    );
    let discount = 0;
    if (campaign.type === 0 && campaign.percentage) {
      // Yüzde indirim
      const sum = includedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      discount = (sum * campaign.percentage) / 100;
    } else if (campaign.type === 1 && campaign.amount) {
      // Tutar indirimi (minOrderAmount kontrolü)
      const sum = includedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      if (!campaign.minOrderAmount || sum >= campaign.minOrderAmount) {
        discount = Math.min(campaign.amount, sum);
      }
    } else if (campaign.type === 2 && campaign.buyQuantity && campaign.payQuantity) {
      // 3 al 2 öde (X al Y öde)
      includedItems.forEach(item => {
        const groupCount = Math.floor(item.quantity / campaign.buyQuantity);
        discount += groupCount * (campaign.buyQuantity - campaign.payQuantity) * item.price;
      });
    }
    setCampaignDiscount(discount);
    setDiscountedTotal(cartTotal - discount);
  }, [selectedCampaignId, availableCampaigns, cartItems, cartTotal]);

  // Kampanya seçimini checkout'a aktar
  const handleCheckout = () => {
    if (!isLoggedIn || !userId) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    // Kampanya seçimini localStorage ile aktar
    if (selectedCampaignId) {
      localStorage.setItem('selectedCampaignId', selectedCampaignId);
      localStorage.setItem('campaignDiscount', campaignDiscount);
    } else {
      localStorage.removeItem('selectedCampaignId');
      localStorage.removeItem('campaignDiscount');
    }
    dispatch(fetchCartFromBackend(userId)).then(() => {
      if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      navigate('/checkout');
    });
  };

  // Kargo ücreti ve toplam hesaplama (checkout ile uyumlu)
  const [shippingCompanies, setShippingCompanies] = React.useState([]); // Kargo şirketleri
  const [selectedShipping, setSelectedShipping] = React.useState(''); // Seçili kargo
  const [shippingCost, setShippingCost] = React.useState(0); // Kargo ücreti

  useEffect(() => {
    if (isLoggedIn && userId) {
      // Kargo şirketleri API'den çekilebilir (örnek kod satırı yoruma alındı)
      // apiGet('/api/ShippingCompany/active').then(res => { 
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

  // Sepet yükleniyorsa spinner göster
  if (status === 'loading') {
    return (
      <CContainer className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <CSpinner color="primary" />
      </CContainer>
    );
  }

  // Kullanıcı giriş yapmamışsa uyarı göster
  if (!isLoggedIn || !userId) {
    return (
      <CContainer className="py-5">
        <CAlert color="warning">
          You must be logged in to view your cart. <CButton color="link" as={Link} to="/login">Login</CButton>
        </CAlert>
      </CContainer>
    );
  }

  // Sepet arayüzü
  return (
    <CContainer className="py-4">
      <CCard className="mb-4">
        <CCardBody>
          <CCardTitle as="h2">My Cart</CCardTitle>
          {cartItems.length === 0 ? (
            <CAlert color="info">
              Your cart is empty. <CButton color="link" as={Link} to="/">Continue Shopping</CButton>
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
                          className="cart-item-image"
                          onClick={() => navigate(`/products/${item.productId}`)}
                          onError={e => { e.target.src = '/images/default-product.jpg'; }}
                        />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }} onClick={() => navigate(`/products/${item.productId}`)}>{item.name || 'No Product Name'}</h5>
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
                          <div className="mb-2">Unit Price: <strong>{(item.price || 0).toFixed(2)}₺</strong></div>
                          <div className="mb-2">Total: <strong>{itemTotal.toFixed(2)}₺</strong></div>
                          <CButton size="sm" color="danger" variant="outline" onClick={() => handleRemoveFromCart(item.id)}>Remove</CButton>
                        </div>
                      </CCardBody>
                    </CCard>
                  );
                })}
              </CCol>
              <CCol md={4}>
                {availableCampaigns.length > 0 && (
                  <CCard className="mb-3">
                    <CCardBody>
                      <h5>Kampanya Seçimi</h5>
                      <select
                        className="form-select mb-2"
                        value={selectedCampaignId || ''}
                        onChange={e => setSelectedCampaignId(e.target.value)}
                      >
                        <option value="">Kampanya seçiniz</option>
                        {availableCampaigns.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} - {c.type === 0 ? `%${c.percentage} indirim` : c.type === 1 ? `${c.amount} TL indirim` : `${c.buyQuantity} al ${c.payQuantity} öde`}
                          </option>
                        ))}
                      </select>
                      {selectedCampaignId && (
                        <div className="mb-2">
                          <b>İndirim:</b> -{campaignDiscount.toFixed(2)}₺<br />
                          <b>İndirimli Toplam:</b> {discountedTotal.toFixed(2)}₺
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                )}
                <CCard className="mb-3">
                  <CCardBody>
                    <CCardTitle as="h4">Order Summary</CCardTitle>
                    <div className="mb-2 d-flex justify-content-between">
                      <span>Subtotal:</span>
                      <span>{cartTotal.toFixed(2)}₺</span>
                    </div>
                    {campaignDiscount > 0 && (
                      <div className="mb-2 d-flex justify-content-between text-success">
                        <span>Kampanya İndirimi:</span>
                        <span>-{campaignDiscount.toFixed(2)}₺</span>
                      </div>
                    )}
                    <div className="mb-2 d-flex justify-content-between">
                      <span>Shipping:</span>
                      {shippingCompanies.length > 0 ? (
                        <>
                          <select value={selectedShipping} onChange={e => setSelectedShipping(e.target.value)} style={{ marginRight: 8 }}>
                            {shippingCompanies.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.price}₺)</option>
                            ))}
                          </select>
                          <span>{shippingCost === 0 ? 'Free' : `${shippingCost.toFixed(2)}₺`}</span>
                        </>
                      ) : (
                        <span>The shipping fee will be added according to the shipping company you choose at the payment step.</span>
                      )}
                    </div>
                    <div className="mb-3 d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span>{discountedTotal.toFixed(2)}₺</span>
                    </div>
                    <CButton color="danger" variant="outline" className="w-100 mb-2" onClick={handleClearCart}>Clear Cart</CButton>
                    <CButton color="secondary" variant="outline" className="w-100 mb-2" as={Link} to="/">Continue Shopping</CButton>
                    <CButton color="success" className="w-100" onClick={handleCheckout}>Checkout</CButton>
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