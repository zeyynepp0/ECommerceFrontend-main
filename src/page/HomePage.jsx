// Ana sayfa - Kategoriler, ürünler ve arama işlemleri
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { useSelector } from 'react-redux';
import { apiGet, parseApiError } from '../utils/api';
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CButton, CInputGroup, CFormInput, CSpinner
} from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE = "https://localhost:7098";

const HomePage = () => {
  // Ürün, kategori, arama ve yüklenme state'leri
  const [products, setProducts] = useState([]); // Ürünler
  const [categories, setCategories] = useState([]); // Kategoriler
  const [searchQuery, setSearchQuery] = useState(''); // Arama sorgusu
  const [loading, setLoading] = useState(true); // Yükleniyor mu?
  const navigate = useNavigate(); // Sayfa yönlendirme

  // Ürün ve kategori verilerini çek
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          apiGet('https://localhost:7098/api/Product'),
          apiGet('https://localhost:7098/api/Category')
        ]);
        setProducts(productsRes);
        setCategories(categoriesRes);
        setLoading(false);
      } catch (error) {
        console.error('Veri çekme hatası:', parseApiError(error));
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Arama işlemi
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Sadece ilk 8 kategori ve ilk 12 aktif ürünü göster
  const limitedCategories = categories.slice(0, 8);
  const limitedProducts = products.filter(p => p.isActive).slice(0, 12);

  // Sayfa arayüzü
  return (
    <CContainer fluid className="py-4">
      {/* Hero Banner */}
      <CCard className="mb-4 position-relative overflow-hidden border-0">
        <div style={{ position: 'relative', height: 320, background: '#222' }}>
          <video style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} autoPlay loop muted playsInline poster="/images/default-category.jpg">
            <source src="/videos/hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'rgba(0,0,0,0.3)' }}>
            <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem' }}>Discover New Season Products</h1>
            <CButton color="primary" as={Link} to="/products" className="mb-3 px-4 py-2 fs-5">Start Shopping</CButton>
            <form onSubmit={handleSearch} className="d-flex justify-content-center w-100" style={{ maxWidth: 500 }}>
              <CInputGroup size="lg">
                <CFormInput
                  type="text"
                  placeholder="Search product..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <CButton type="submit" color="secondary"><FiSearch /></CButton>
              </CInputGroup>
            </form>
          </div>
        </div>
      </CCard>

      {/* Kategoriler */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="mb-0">Categories</h2>
        <CButton color="link" as={Link} to="/categories">View All</CButton>
      </div>
      <CRow className="mb-4 g-3">
        {limitedCategories.map(category => (
          <CCol xs={12} sm={6} md={4} lg={3} key={category.id}>
            <CCard
              className="h-100 text-decoration-none shadow-sm category-card-hover"
              style={{ cursor: 'pointer', background: '#fff', color: undefined, border: '1px solid #e0e0e0' }}
              onClick={() => navigate(`/products?category=${category.id}`)}
            >
              <img
                src={category.imageUrl
                  ? (category.imageUrl.startsWith('http') ? category.imageUrl : API_BASE + category.imageUrl)
                  : (category.image
                    ? (category.image.startsWith('http') ? category.image : API_BASE + category.image)
                    : '/images/default-category.jpg')}
                alt={category.name}
                className="category-card-image"
                onError={e => { e.target.src = '/images/default-category.jpg'; }}
              />
              <CCardBody>
                <CCardTitle>{category.name}</CCardTitle>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Ürünler */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="mb-0">All Products</h2>
        <CButton color="link" as={Link} to="/products">View All</CButton>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <CSpinner color="primary" />
        </div>
      ) : (
        <CRow className="g-3">
          {limitedProducts.map(product => (
            <CCol xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard
                product={{ ...product, imageUrl: product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl) : '/images/default-product.jpg' }}
                onFavoriteChange={() => {}}
              />
            </CCol>
          ))}
        </CRow>
      )}

      {/* Kampanya Banner */}
      <CCard className="mt-5 bg-warning bg-opacity-25 border-0 text-center">
        <CCardBody>
          <CCardTitle as="h2">Start Shopping</CCardTitle>
          <CButton color="warning" as={Link} to="/products?discount=true">Discover Now</CButton>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default HomePage;