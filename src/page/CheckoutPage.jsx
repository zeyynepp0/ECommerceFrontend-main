import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiDelete } from '../utils/api';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CForm, CFormLabel, CFormInput, CFormSelect, CButton, CAlert, CSpinner } from '@coreui/react';

const CheckoutPage = () => {
  const { userId, isLoggedIn } = useSelector(state => state.user);
  const [addresses, setAddresses] = useState([]);
  const [shippingCompanies, setShippingCompanies] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedShipping, setSelectedShipping] = useState('');
  const [card, setCard] = useState({ name: '', number: '', expiryMonth: '', expiryYear: '', cvv: '' });
  const [cardError, setCardError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [deliveryPersonPhone, setDeliveryPersonPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('0'); // Default: CreditCard
  const [eligibleCampaigns, setEligibleCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [campaignDiscount, setCampaignDiscount] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [addressRes, shippingRes, cartRes] = await Promise.all([
          apiGet(`/api/Address/user/${userId}`),
          apiGet('/api/ShippingCompany/active'),
          apiGet(`/api/CartItem/user/${userId}`)
        ]);
        setAddresses(addressRes);
        setShippingCompanies(shippingRes);
        setCart(cartRes);
        // Kampanya uygunluk sorgusu
        const productIds = (cartRes || []).map(item => item.productId || item.id);
        const categoryIds = (cartRes || []).map(item => item.categoryId).filter(Boolean);
        if (productIds.length > 0 || categoryIds.length > 0) {
          const eligible = await apiPost('/api/campaign/eligible', { productIds, categoryIds });
          setEligibleCampaigns(eligible);
        } else {
          setEligibleCampaigns([]);
        }
        setSelectedAddress(addressRes[0]?.id || '');
        setSelectedShipping(shippingRes[0]?.id || '');
        setLoading(false);
        if (!cartRes || cartRes.length === 0) {
          setError('Your cart is empty.');
          setTimeout(() => navigate('/cart'), 1500);
        }
      } catch (err) {
        setError('Checkout data could not be loaded.');
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn, userId, navigate]);

  // cartTotal hesaplamasında price ve quantity'nin sayı olduğundan emin ol
  const rawCartTotal = useMemo(() => cart.reduce((sum, item) => {
    const price = Number(item.price ?? (item.product ? item.product.price : 0)) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + price * quantity;
  }, 0), [cart]);
  const cartTotal = Math.max(0, rawCartTotal - campaignDiscount);

  // Kampanya indirimi hesaplama
  useEffect(() => {
    if (!selectedCampaignId) {
      setCampaignDiscount(0);
      return;
    }
    const selected = eligibleCampaigns.find(c => c.id === Number(selectedCampaignId));
    if (!selected) {
      setCampaignDiscount(0);
      return;
    }
    // Kampanyanın kapsadığı ürün id'leri
    const campaignProductIds = selected.productIds || [];
    // Sadece kampanyaya dahil ürünlerin toplamı
    const campaignProductsTotal = cart.reduce((sum, item) => {
      const productId = item.productId || item.id;
      if (campaignProductIds.includes(productId)) {
        const price = Number(item.price ?? (item.product ? item.product.price : 0)) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + price * quantity;
      }
      return sum;
    }, 0);
    let discount = 0;
    if (selected.type === 0) {
      // Yüzde indirim sadece kampanya ürünlerine
      discount = (campaignProductsTotal * selected.percentage) / 100;
    } else if (selected.type === 1) {
      // Tutar indirimi, sadece kampanya ürünleri varsa uygula
      discount = campaignProductsTotal > 0 ? selected.amount : 0;
    } else if (selected.type === 2) {
      // X al Y öde, sadece kampanya ürünlerine uygula (örnek basit mantık)
      const campaignItems = cart.filter(item => campaignProductIds.includes(item.productId || item.id));
      const minPay = Math.min(...campaignItems.map(item => item.quantity || 0));
      discount = minPay > 0 ? (selected.buyQuantity - selected.payQuantity) * (campaignItems[0]?.price || 0) : 0;
    }
    setCampaignDiscount(discount);
  }, [selectedCampaignId, eligibleCampaigns, cart]);
  const selectedShippingObj = shippingCompanies.find(s => s.id === Number(selectedShipping));
  // Backend'de ücretsiz kargo limiti kontrolü olduğu için, burada sadece seçilen firmanın fiyatını gösteriyoruz.
  const shippingCost = selectedShippingObj ? (cartTotal > selectedShippingObj.freeShippingLimit ? 0 : selectedShippingObj.price) : 0;
  const total = cartTotal + shippingCost;
  // discountedTotal artık cartTotal ile aynı (indirimli toplam)
  const discountedTotal = total;

  // Kart numarasını xxxx-xxxx-xxxx-xxxx formatında göster
  const formatCardNumber = (value) => {
    // Sadece rakamları al
    const digits = value.replace(/\D/g, '').slice(0, 16);
    // 4'lü gruplara ayır
    return digits.replace(/(\d{4})(?=\d)/g, '$1-');
  };

  // Kart bilgileri validasyonu
  const validateCard = () => {
    const digits = card.number.replace(/\D/g, '');
    if (digits.length !== 16) return 'Kart numarası 16 haneli olmalı.'; // Kart validasyonu Türkçe açıklama
    if (!/^[0-9]{16}$/.test(digits)) return 'Kart numarası sadece rakamlardan oluşmalı.';
    if (!card.name.trim()) return 'Kart sahibi adı boş olamaz.';
    const month = Number(card.expiryMonth);
    if (isNaN(month) || month < 1 || month > 12) return 'Ay 1-12 arasında olmalı.';
    const year = Number(card.expiryYear);
    const nowYear = new Date().getFullYear();
    if (isNaN(year) || year < nowYear) return 'Yıl geçerli olmalı.';
    if (!/^[0-9]{3,4}$/.test(card.cvv)) return 'CVV 3 veya 4 haneli olmalı.';
    return '';
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCardError('');
    if (!selectedAddress || !selectedShipping) {
      setError('You must select an address and a shipping company. If there is no address or shipping company listed, please add an address from your profile or contact the system administrator.');
      return;
    }
    if (!deliveryPerson) {
      setError('You must enter the name of the person who will receive the delivery.');
      return;
    }
    if (!deliveryPersonPhone) {
      setError('You must enter the phone number of the person who will receive the delivery.');
      return;
    }
    const cardValidation = validateCard();
    if (cardValidation) {
      setCardError(cardValidation);
      return;
    }
    try {
      const selectedAddressObj = addresses.find(a => a.id === Number(selectedAddress));
      const orderBody = {
        userId,
        addressId: Number(selectedAddress),
        shippingCompanyId: Number(selectedShipping),
        paymentMethod: Number(paymentMethod),
        deliveryPersonName: deliveryPerson,
        deliveryPersonPhone: deliveryPersonPhone,
        orderItems: cart.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          unitPrice: Number(item.price ?? (item.product ? item.product.price : 0))
        })),
        address: selectedAddressObj,
        campaignId: selectedCampaignId ? Number(selectedCampaignId) : null,
        orderNote: orderNote,
        totalAmount: discountedTotal // indirimli toplamı gönder
        // campaignDiscount gönderilmeyecek
      };
      console.log('Order body:', orderBody);
      const orderRes = await apiPost('/api/Order', orderBody);
      setOrderId(orderRes.orderId);
      await apiPost('/api/Order/payment', {
        orderId: orderRes.orderId,
        cardHolderName: card.name,
        cardNumber: card.number.replace(/\D/g, ''),
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        cvv: card.cvv
      });
      await apiDelete(`/api/CartItem/user/${userId}`);
      localStorage.removeItem('cart');
      localStorage.removeItem('selectedCampaignId');
      localStorage.removeItem('campaignDiscount');
      setSuccess('Siparişiniz başarıyla oluşturuldu ve ödeme alındı!');
      setTimeout(() => navigate(`/profile/${userId}?tab=orders`), 2000);
    } catch (err) {
      let msg = 'Sipariş veya ödeme işlemi başarısız.';
      if (err?.response?.data?.message) {
        msg += ' ' + err.response.data.message;
      } else if (err?.message) {
        msg += ' ' + err.message;
      }
      setError(msg + ' Please check your address, shipping company, and card information. There may be a stock or shipping company error.');
      console.error('Order error:', err?.response?.data || err);
    }
  };

  if (loading) return <CContainer className="py-5 d-flex justify-content-center align-items-center"><CSpinner color="primary" /></CContainer>;
  if (cart.length === 0) return <CContainer className="py-5"><CAlert color="info">Your cart is empty. <CButton color="link" onClick={() => navigate('/')}>Continue Shopping</CButton></CAlert></CContainer>;

  return (
    <CContainer className="py-4">
      <CCard className="mb-4">
        <CCardBody>
          <CCardTitle as="h2">Complete Order</CCardTitle>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}
          <CForm onSubmit={handleOrder} className="row g-4">
            <CCol md={6}>
              <CFormLabel>Address Selection</CFormLabel>
              <CFormSelect value={selectedAddress} onChange={e => setSelectedAddress(e.target.value)} required>
                {addresses.map(addr => (
                  <option key={addr.id} value={addr.id}>{addr.addressTitle} - {addr.city} {addr.state}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>Shipping Company</CFormLabel>
              <CFormSelect value={selectedShipping} onChange={e => setSelectedShipping(e.target.value)} required>
                {shippingCompanies.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.price}₺)</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>Payment Method</CFormLabel>
              <CFormSelect value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required>
                <option value="0">Credit Card</option>
                <option value="1">Debit Card</option>
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>Recipient Name</CFormLabel>
              <CFormInput placeholder="Full Name" value={deliveryPerson} onChange={e => setDeliveryPerson(e.target.value)} required />
              <CFormLabel className="mt-2">Recipient Phone</CFormLabel>
              <CFormInput placeholder="Phone" value={deliveryPersonPhone} onChange={e => setDeliveryPersonPhone(e.target.value)} required />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Kampanya Seçimi</CFormLabel>
              <CFormSelect value={selectedCampaignId} onChange={e => setSelectedCampaignId(e.target.value)}>
                <option value="">Kampanya seçiniz</option>
                {eligibleCampaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 0 ? `%${c.percentage}` : c.type === 1 ? `${c.amount}₺` : 'X Al Y Öde'})
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={12}>
              <CFormLabel>Sipariş Notu</CFormLabel>
              <CFormInput
                placeholder="Siparişinizle ilgili notunuz (isteğe bağlı)"
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
              />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Card Information</CFormLabel>
              <CRow className="g-2">
                <CCol md={6}>
                  <CFormInput placeholder="Cardholder Name" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} required />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    placeholder="Card Number"
                    value={formatCardNumber(card.number)}
                    onChange={e => {
                      // Sadece rakam girilsin ve formatlansın
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCard({ ...card, number: raw });
                    }}
                    required
                    maxLength={19}
                  />
                </CCol>
                <CCol md={3}><CFormInput placeholder="Month (MM)" value={card.expiryMonth} onChange={e => setCard({ ...card, expiryMonth: e.target.value.replace(/\D/g, '').slice(0,2) })} required maxLength={2} /></CCol>
                <CCol md={3}><CFormInput placeholder="Year (YYYY)" value={card.expiryYear} onChange={e => setCard({ ...card, expiryYear: e.target.value.replace(/\D/g, '').slice(0,4) })} required maxLength={4} /></CCol>
                <CCol md={3}><CFormInput placeholder="CVV" value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0,4) })} required maxLength={4} /></CCol>
              </CRow>
              {cardError && <CAlert color="danger" className="mt-2">{cardError}</CAlert>}
            </CCol>
            <CCol md={12} className="mt-3">
              <CCard className="mb-2">
                <CCardBody>
                  <div className="d-flex justify-content-between mb-2"><span>Subtotal:</span><span>{rawCartTotal.toFixed(2)}₺</span></div>
                  {campaignDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success"><span>Kampanya İndirimi:</span><span>-{campaignDiscount.toFixed(2)}₺</span></div>
                  )}
                  <div className="d-flex justify-content-between mb-2"><span>Shipping:</span><span>{shippingCost === 0 ? 'Free' : `${shippingCost.toFixed(2)}₺`}</span></div>
                  <div className="d-flex justify-content-between fw-bold"><span>Total:</span><span>{discountedTotal.toFixed(2)}₺</span></div>
                </CCardBody>
              </CCard>
              <CButton color="success" type="submit" className="w-100 py-2" size="lg">Complete Order and Pay</CButton>
              <CCol md={6} className="d-flex align-items-end">
                <CButton color="link" onClick={() => navigate(`/profile/${userId}?tab=addresses`)}>
                  Add New Address
                </CButton>
              </CCol>
            </CCol>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default CheckoutPage;