import React, { useEffect, useState } from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardImage, CCardTitle, CButton, CSpinner } from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';

const API_BASE = "http://localhost:5220";

// Mock veri kaldırıldı

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiGet('http://localhost:5220/api/Category');
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <CContainer className="py-4">
      <h2 className="mb-4 fw-bold">Kategoriler</h2>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <CSpinner color="primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-5 text-muted">Hiç kategori bulunamadı.</div>
      ) : (
        <CRow xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 3 }} lg={{ cols: 4 }} xl={{ cols: 5 }} className="g-4">
          {categories.map(cat => (
            <CCol key={cat.id}>
              <CCard className="h-100 category-card shadow-sm">
                <CCardImage 
                  src={cat.imageUrl
                    ? (cat.imageUrl.startsWith('http') ? cat.imageUrl : API_BASE + cat.imageUrl)
                    : '/images/default-category.jpg'}
                  alt={cat.name}
                  style={{ height: 140, objectFit: 'cover' }}
                  onError={e => { e.target.src = '/images/default-category.jpg'; }}
                />
                <CCardBody className="d-flex flex-column justify-content-between">
                  <CCardTitle className="fw-semibold mb-2">{cat.name}</CCardTitle>
                  <CButton color="primary" variant="outline" onClick={() => navigate(`/products?category=${cat.id}`)}>
                    Ürünleri Gör
                  </CButton>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      )}
    </CContainer>
  );
};

export default CategoriesPage; 