// Kategori yönetim sayfası - Kategori listeleme, silme, aktif/pasif işlemleri
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete, apiPut } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert, CImage, CFormSwitch
} from '@coreui/react';

const API_BASE = "https://localhost:7098";

const CategoriesPage = () => {
  // Kategori verileri ve durum state'leri
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Sayfa yönlendirme için hook
  const navigate = useNavigate();
  // Filtreleme state'i (tümü/aktif/pasif)
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'passive'

  // Sayfa yüklendiğinde kategorileri backend'den çek
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await apiGet('https://localhost:7098/api/Category');
        setCategories(data);
      } catch (err) {
        setError('Categories could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Kategori silme işlemi
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/Category/delete/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      let msg = 'Category could not be deleted.';
      if (err?.response?.data?.message) msg = err.response.data.message;
      setError(msg);
      alert(msg);
    }
  };

  // Kategori aktif/pasif işlemi
  const handleToggleActive = async (category) => {
    try {
      await apiPut(`https://localhost:7098/api/Category/update/${category.id}`, {
        id: category.id,
        name: category.name,
        imageUrl: category.imageUrl,
        isActive: !category.isActive
      });
      setCategories(categories.map(c => c.id === category.id ? { ...c, isActive: !c.isActive } : c));
    } catch (err) {
      let msg = 'Active status could not be changed.';
      if (err?.response?.data) msg = err.response.data;
      if (typeof msg === 'string' && msg.includes('kategori') && msg.includes('aktif ürün')) {
        alert('This category cannot be deactivated while it has active product(s)!');
      } else {
        setError(msg);
        alert(msg);
      }
    }
  };

  // Kategorileri filtrele (aktif/pasif/tümü)
  const filteredCategories = categories.filter(cat =>
    filter === 'all' ? true : filter === 'active' ? cat.isActive : !cat.isActive
  );
  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CCardTitle>Categories</CCardTitle>
            <div>
              {/* Filtre butonları */}
              <CButton color={filter === 'all' ? 'secondary' : 'light'} className="me-2" onClick={() => setFilter('all')}>All</CButton>
              <CButton color={filter === 'active' ? 'success' : 'light'} className="me-2" onClick={() => setFilter('active')}>Show Active</CButton>
              <CButton color={filter === 'passive' ? 'danger' : 'light'} onClick={() => setFilter('passive')}>Show Passive</CButton>
              {/* Yeni kategori ekle butonu */}
              <CButton color="success" as={Link} to="/admin/categories/add" className="ms-3">+ Add New Category</CButton>
            </div>
          </div>
          {/* Yükleniyor/hata/kategori tablosu */}
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
                  <CTableHeaderCell>Active?</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredCategories.map(category => (
                  <CTableRow key={category.id}>
                    <CTableDataCell>{category.id}</CTableDataCell>
                    <CTableDataCell>
                      {/* Kategori görseli */}
                      <CImage
                        src={category.imageUrl ? (category.imageUrl.startsWith('http') ? category.imageUrl : API_BASE + category.imageUrl) : '/images/default-category.jpg'}
                        alt={category.name}
                        className="admin-table-image"
                        onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
                      />
                    </CTableDataCell>
                    {/* Kategori adı (düzenleme için tıklanabilir) */}
                    <CTableDataCell style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }} onClick={() => navigate(`/admin/categories/edit/${category.id}`)}>{category.name}</CTableDataCell>
                    {/* Aktif/pasif durumu */}
                    <CTableDataCell>
                      <span className={`badge ${category.isActive ? 'bg-success' : 'bg-danger'}`}>{category.isActive ? 'Active' : 'Passive'}</span>
                    </CTableDataCell>
                    {/* İşlem butonları */}
                    <CTableDataCell>
                      <CButton
                        color={category.isActive ? 'warning' : 'success'}
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(category)}
                        className="me-2"
                      >
                        {category.isActive ? 'Make Passive' : 'Make Active'}
                      </CButton>
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        as={Link}
                        to={`/admin/categories/edit/${category.id}`}
                      >
                        Edit
                      </CButton>
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
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

export default CategoriesPage; 