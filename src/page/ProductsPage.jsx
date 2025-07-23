import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiStar, 
  FiShoppingCart,
  FiHeart
} from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import '../css/ProductsPage.css';
import { useCart } from '../components/CartContext';
import { apiGet, parseApiError } from '../utils/api'; // Ortak API fonksiyonları
import {
  CContainer, CRow, CCol, CButton, CSpinner, CPagination, CPaginationItem, CCard, CCardBody, CCardTitle, CFormInput, CFormSelect, CFormCheck, COffcanvas, COffcanvasHeader, COffcanvasBody, CForm, CInputGroup
} from '@coreui/react';

const API_BASE = "http://localhost:5220";
const PAGE_SIZE = 2; // sayfada kaç tane ürün gösterileceğini gösteriyor

const ProductsPage = ({ darkMode }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: '',
    minPrice: '',
    maxPrice: '',
    categoryId: '',
    color: '',
    brand: '',
    inStock: false,
    discountOnly: false,
    rating: '',
    sortBy: 'default',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [colorOptions, setColorOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [ratingOptions] = useState([5,4,3,2,1]);
  const location = useLocation();
  const navigate = useNavigate();

  // URL parametrelerini işle
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    const discountParam = urlParams.get('discount');
    const pageParam = urlParams.get('page');

    const newFilters = { ...filters };
    if (searchParam) newFilters.searchQuery = searchParam;
    if (categoryParam) newFilters.categoryId = categoryParam;
    setFilters(newFilters);
    if (pageParam) setCurrentPage(Number(pageParam));
    else setCurrentPage(1);
  }, [location.search]);

  // Veritabanından ürünleri ve kategorileri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          apiGet('http://localhost:5220/api/Product'),
          apiGet('http://localhost:5220/api/Category')
        ]);
        setProducts(productsRes);
        setFilteredProducts(productsRes);
        setCategories(categoriesRes);
        // Renk ve marka seçenekleri
        setColorOptions([...new Set(productsRes.map(p => p.color).filter(Boolean))]);
        setBrandOptions([...new Set(productsRes.map(p => p.brand).filter(Boolean))]);
      } catch (error) {
        console.error('Veri çekme hatası:', parseApiError(error));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtreleme fonksiyonu (renk, marka, stok, indirim, puan eklendi)
  useEffect(() => {
    let result = [...products];
    result = result.filter(product => product.isActive); // Sadece aktif ürünler
    if (filters.searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }
    if (filters.minPrice) {
      result = result.filter(product => product.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(product => product.price <= Number(filters.maxPrice));
    }
    if (filters.categoryId) {
      result = result.filter(product => String(product.categoryId) === String(filters.categoryId));
    }
    if (filters.color) {
      result = result.filter(product => product.color === filters.color);
    }
    if (filters.brand) {
      result = result.filter(product => product.brand === filters.brand);
    }
    if (filters.inStock) {
      result = result.filter(product => product.stock > 0);
    }
    if (filters.discountOnly) {
      result = result.filter(product => product.discount > 0);
    }
    if (filters.rating) {
      result = result.filter(product => Math.floor(product.rating || 0) >= filters.rating);
    }
    switch (filters.sortBy) {
      case 'priceLowToHigh':
        result.sort((a, b) => a.price - b.price); break;
      case 'priceHighToLow':
        result.sort((a, b) => b.price - a.price); break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating); break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break;
    }
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [filters, products]);

  // Pagination hesaplama
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set('page', page);
    navigate({ search: params.toString() });
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  // Filtreleri temizle fonksiyonu
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      minPrice: '',
      maxPrice: '',
      categoryId: '',
      color: '',
      brand: '',
      inStock: false,
      discountOnly: false,
      rating: '',
      sortBy: 'default',
    });
  };

  // Yatay filtre barı ve offcanvas kaldırıldı
  return (
    <CContainer fluid className="py-4">
      <CRow>
        {/* Ürünler Grid (sol) */}
        <CCol xs={12} md={8} lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="mb-0">Tüm Ürünler</h2>
            <span className="text-muted">{filteredProducts.length} ürün bulundu</span>
          </div>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
              <CSpinner color="primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5">Filtrelerinize uygun ürün bulunamadı.</div>
          ) : (
            <>
              <CRow className="g-3">
                {paginatedProducts.map(product => (
                  <CCol xs={12} sm={6} md={6} lg={4} key={product.id}>
                    <ProductCard
                      product={{ ...product, imageUrl: product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl) : '/images/default-product.jpg' }}
                      onFavoriteChange={() => {}}
                    />
                  </CCol>
                ))}
              </CRow>
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <CPagination align="center">
                    {[...Array(totalPages)].map((_, idx) => (
                      <CPaginationItem
                        key={idx + 1}
                        active={currentPage === idx + 1}
                        onClick={() => handlePageChange(idx + 1)}
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
        </CCol>
        {/* Filtre Paneli (sağ) */}
        <CCol xs={12} md={4} lg={3}>
          <CCard className="filters-sidebar p-3 sticky-top" style={{ top: 90 }}>
            <CCardTitle className="mb-3">Filtreler</CCardTitle>
            <div className="filter-group mb-3">
              <label>Kategori</label>
              <CFormSelect
                value={filters.categoryId}
                onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Tümü</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </CFormSelect>
            </div>
            <div className="filter-group mb-3">
              <label>Fiyat Aralığı</label>
              <div className="d-flex gap-2">
                <CFormInput type="number" min={0} placeholder="Min" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
                <CFormInput type="number" min={0} placeholder="Max" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
              </div>
            </div>
            {colorOptions.length > 0 && (
              <div className="filter-group mb-3">
                <label>Renk</label>
                <CFormSelect value={filters.color} onChange={e => setFilters(f => ({ ...f, color: e.target.value }))}>
                  <option value="">Tümü</option>
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </CFormSelect>
              </div>
            )}
            {brandOptions.length > 0 && (
              <div className="filter-group mb-3">
                <label>Marka</label>
                <CFormSelect value={filters.brand} onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}>
                  <option value="">Tümü</option>
                  {brandOptions.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </CFormSelect>
              </div>
            )}
            <div className="filter-group mb-3">
            <label>Stokta Olanlar</label>
              <CFormCheck
              
                checked={filters.inStock}
                onChange={e => setFilters(f => ({ ...f, inStock: e.target.checked }))}
              />
              <label>Sadece İndirimli</label>
              <CFormCheck
                checked={filters.discountOnly}
                onChange={e => setFilters(f => ({ ...f, discountOnly: e.target.checked }))}
              />
            </div>
            <div className="filter-group mb-3">
              <label>Puan</label>
              <CFormSelect value={filters.rating} onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}>
                <option value="">Tümü</option>
                {ratingOptions.map(r => (
                  <option key={r} value={r}>{r} yıldız ve üzeri</option>
                ))}
              </CFormSelect>
            </div>
            <div className="filter-group mb-3">
              <label>Sırala</label>
              <CFormSelect value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
                <option value="default">Varsayılan</option>
                <option value="priceLowToHigh">Fiyat: Artan</option>
                <option value="priceHighToLow">Fiyat: Azalan</option>
                <option value="rating">Puan</option>
                <option value="newest">En Yeni</option>
              </CFormSelect>
            </div>
            <CButton color="secondary" className="w-100 mt-2" onClick={handleResetFilters}>Filtreleri Temizle</CButton>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ProductsPage;