// Kampanya detay sayfası - Kampanya bilgileri, ürün ve kategori detaylarını gösterir
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CButton, CCard, CCardBody, CCardHeader, CListGroup, CListGroupItem, CSpinner, CAlert } from '@coreui/react';

const API_URL = 'https://localhost:7098/api/campaign';
const PRODUCT_URL = 'https://localhost:7098/api/product';
const CATEGORY_URL = 'https://localhost:7098/api/category';

const CampaignDetailPage = () => {
  // URL'den kampanya id'sini al
  const { id } = useParams();
  // Kampanya, ürünler, kategoriler ve durum state'leri
  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Sayfa yönlendirme için hook
  const navigate = useNavigate();

  // Sayfa yüklendiğinde kampanya detayını çek
  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Kampanya, ürün ve kategori detaylarını backend'den çek
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setCampaign(res.data);
      // Kampanyaya ait ürünleri çek
      if (res.data.productIds && res.data.productIds.length > 0) {
        const prodRes = await axios.get(PRODUCT_URL);
        setProducts(prodRes.data.filter(p => res.data.productIds.includes(p.id)));
      }
      // Kampanyaya ait kategorileri çek
      if (res.data.categoryIds && res.data.categoryIds.length > 0) {
        const catRes = await axios.get(CATEGORY_URL);
        setCategories(catRes.data.filter(c => res.data.categoryIds.includes(c.id)));
      }
    } catch (err) {
      setError('Kampanya detayları yüklenemedi.');
    }
    setLoading(false);
  };

  // Yükleniyor veya hata durumları
  if (loading) return <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>;
  if (error) return <CAlert color="danger">{error}</CAlert>;
  if (!campaign) return <CAlert color="warning">Kampanya bulunamadı.</CAlert>;

  // Kampanya tipini metne çevirir
  const getTypeText = type => {
    switch (type) {
      case 0: return 'Yüzde İndirim';
      case 1: return 'Tutar İndirimi';
      case 2: return '3 Al 2 Öde (veya X Al Y Öde)';
      default: return 'Bilinmiyor';
    }
  };

  // Sayfa arayüzü
  return (
    <div>
      {/* Geri butonu */}
      <CButton color="secondary" className="mb-3" onClick={() => navigate(-1)}>Geri</CButton>
      <CCard>
        <CCardHeader>
          <h4 className="mb-0">Kampanya Detayı</h4>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3"><b>Adı:</b> {campaign.name}</div>
          <div className="mb-3"><b>Açıklama:</b> {campaign.description}</div>
          <div className="mb-3"><b>Tip:</b> {getTypeText(campaign.type)}</div>
          {/* Kampanya tipine göre indirim oranı/tutarı */}
          {campaign.type === 0 && <div className="mb-3"><b>İndirim Oranı:</b> %{campaign.percentage}</div>}
          {campaign.type === 1 && <div className="mb-3"><b>İndirim Tutarı:</b> {campaign.amount} TL</div>}
          {campaign.type === 2 && <div className="mb-3"><b>Al:</b> {campaign.buyQuantity} <b>Öde:</b> {campaign.payQuantity}</div>}
          {campaign.minOrderAmount && <div className="mb-3"><b>Minimum Tutar:</b> {campaign.minOrderAmount} TL</div>}
          <div className="mb-3"><b>Başlangıç:</b> {campaign.startDate?.slice(0, 10)}</div>
          <div className="mb-3"><b>Bitiş:</b> {campaign.endDate ? campaign.endDate.slice(0, 10) : '-'}</div>
          <div className="mb-3"><b>Aktif mi?:</b> {campaign.isActive ? 'Evet' : 'Hayır'}</div>
          {/* Kampanyaya dahil ürünler */}
          <div className="mb-3">
            <b>Geçerli Ürünler:</b>
            {products.length === 0 ? <span> Yok</span> : (
              <CListGroup className="mt-2">
                {products.map(p => <CListGroupItem key={p.id}>{p.name}</CListGroupItem>)}
              </CListGroup>
            )}
          </div>
          {/* Kampanyaya dahil kategoriler */}
          <div className="mb-3">
            <b>Geçerli Kategoriler:</b>
            {categories.length === 0 ? <span> Yok</span> : (
              <CListGroup className="mt-2">
                {categories.map(c => <CListGroupItem key={c.id}>{c.name}</CListGroupItem>)}
              </CListGroup>
            )}
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default CampaignDetailPage; 