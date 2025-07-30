// Ürün yönetim sayfası - Ürün listeleme, silme, aktif/pasif işlemleri
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete, apiPut } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert, CImage, CFormSwitch
} from '@coreui/react';

const API_BASE = "https://localhost:7098";

const ProductsPage = () => {
  // Ürün, kategori ve durum state'leri
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  // Filtreleme state'i (tümü/aktif/pasif)
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'passive'
  // Sayfa yönlendirme için hook
  const navigate = useNavigate();

  // Sayfa yüklendiğinde ürün ve kategori verilerini backend'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          apiGet('https://localhost:7098/api/Product'),
          apiGet('https://localhost:7098/api/Category')
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Products or categories could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Ürün silme işlemi
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/Product/delete/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      let msg = 'Product could not be deleted.';
      if (err?.response?.data?.message) msg = err.response.data.message;
      setError(msg);
      alert(msg);
    }
  };

  // Ürün aktif/pasif işlemi
  const handleToggleActive = async (product) => {
    const category = categories.find(c => c.id === product.categoryId);
    if (!product.isActive && category && !category.isActive) {
      alert('A product cannot be activated if its category is passive!');
      return;
    }
    try {
      await apiPut(`https://localhost:7098/api/Product/update/${product.id}`, {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        isActive: !product.isActive
      });
      setProducts(products.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
    } catch (err) {
      let msg = 'Could not change active status.';
      if (err?.response?.data) msg = err.response.data;
      setError(msg);
      alert(msg);
    }
  };

  // Ürünleri filtrele (aktif/pasif/tümü)
  const filteredProducts = products.filter(p =>
    filter === 'all' ? true : filter === 'active' ? p.isActive : !p.isActive
  );
  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CCardTitle>Products</CCardTitle>
            <div>
              {/* Filtre butonları */}
              <CButton color={filter === 'all' ? 'secondary' : 'light'} className="me-2" onClick={() => setFilter('all')}>All</CButton>
              <CButton color={filter === 'active' ? 'success' : 'light'} className="me-2" onClick={() => setFilter('active')}>Show Active</CButton>
              <CButton color={filter === 'passive' ? 'danger' : 'light'} onClick={() => setFilter('passive')}>Show Passive</CButton>
              {/* Yeni ürün ekle butonu */}
              <CButton color="success" as={Link} to="/admin/products/add" className="ms-3">+ Add New Product</CButton>
            </div>
          </div>
          {/* Yükleniyor/hata/ürün tablosu */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Image</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell>Price</CTableHeaderCell>
                  <CTableHeaderCell>Stock</CTableHeaderCell>
                  <CTableHeaderCell>Active?</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredProducts.map(product => (
                  <CTableRow key={product.id}>
                    <CTableDataCell>{product.id}</CTableDataCell>
                    <CTableDataCell>
                      {/* Ürün görseli */}
                      <CImage
                        src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl) : '/images/default-product.jpg'}
                        alt={product.name}
                        className="admin-table-image"
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      />
                    </CTableDataCell>
                    {/* Ürün adı (düzenleme için tıklanabilir) */}
                    <CTableDataCell style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }} onClick={() => navigate(`/admin/products/edit/${product.id}`)}>{product.name}</CTableDataCell>
                    <CTableDataCell>{product.categoryName}</CTableDataCell>
                    <CTableDataCell>{product.price} ₺</CTableDataCell>
                    <CTableDataCell>{product.stock}</CTableDataCell>
                    {/* Aktif/pasif durumu */}
                    <CTableDataCell>
                      <span className={`badge ${product.isActive ? 'bg-success' : 'bg-danger'}`}>{product.isActive ? 'Active' : 'Passive'}</span>
                    </CTableDataCell>
                    {/* İşlem butonları */}
                    <CTableDataCell>
                      <CButton
                        color={product.isActive ? 'warning' : 'success'}
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(product)}
                        className="me-2"
                      >
                        {product.isActive ? 'Make Passive' : 'Make Active'}
                      </CButton>
                      <CButton
                        color="info"
                        variant="outline"
                        size="sm"
                        as={Link}
                        to={`/admin/products/edit/${product.id}`}
                        className="me-2"
                      >
                        Edit
                      </CButton>
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        as={Link}
                        to={`/products/${product.id}`}
                      >
                        Detail
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default ProductsPage; 