import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete, apiPut } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert, CImage, CFormSwitch
} from '@coreui/react';

const API_BASE = "http://localhost:5220";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'passive'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          apiGet('http://localhost:5220/api/Product'),
          apiGet('http://localhost:5220/api/Category')
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiDelete(`http://localhost:5220/api/Product/delete/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      let msg = 'Product could not be deleted.';
      if (err?.response?.data?.message) msg = err.response.data.message;
      setError(msg);
      alert(msg);
    }
  };

  const handleToggleActive = async (product) => {
    const category = categories.find(c => c.id === product.categoryId);
    if (!product.isActive && category && !category.isActive) {
      alert('A product cannot be activated if its category is passive!');
      return;
    }
    try {
      await apiPut(`http://localhost:5220/api/Product/update/${product.id}`, {
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

  const filteredProducts = products.filter(p =>
    filter === 'all' ? true : filter === 'active' ? p.isActive : !p.isActive
  );

  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CCardTitle>Products</CCardTitle>
            <div>
              <CButton color={filter === 'all' ? 'secondary' : 'light'} className="me-2" onClick={() => setFilter('all')}>All</CButton>
              <CButton color={filter === 'active' ? 'success' : 'light'} className="me-2" onClick={() => setFilter('active')}>Show Active</CButton>
              <CButton color={filter === 'passive' ? 'danger' : 'light'} onClick={() => setFilter('passive')}>Show Passive</CButton>
              <CButton color="success" as={Link} to="/admin/products/add" className="ms-3">+ Add New Product</CButton>
            </div>
          </div>
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
                      <CImage
                        src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl) : '/images/default-product.jpg'}
                        alt={product.name}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      />
                    </CTableDataCell>
                    <CTableDataCell style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }} onClick={() => navigate(`/admin/products/edit/${product.id}`)}>{product.name}</CTableDataCell>
                    <CTableDataCell>{product.categoryName}</CTableDataCell>
                    <CTableDataCell>{product.price} ₺</CTableDataCell>
                    <CTableDataCell>{product.stock}</CTableDataCell>
                    <CTableDataCell>
                      <span className={`badge ${product.isActive ? 'bg-success' : 'bg-danger'}`}>{product.isActive ? 'Active' : 'Passive'}</span>
                    </CTableDataCell>
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