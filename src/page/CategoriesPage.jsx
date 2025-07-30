// Kategoriler sayfası - Tüm kategorileri listeler ve ürünlere yönlendirir
import React, { useEffect, useState } from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardImage, CCardTitle, CButton, CSpinner } from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';

const API_BASE = "https://localhost:7098";

const CategoriesPage = () => {
  // Kategori verileri ve yüklenme durumu
  const [categories, setCategories] = useState([]); // Kategoriler
  const [loading, setLoading] = useState(true); // Yükleniyor mu?
  const navigate = useNavigate(); // Sayfa yönlendirme

  // Kategorileri backend'den çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiGet('https://localhost:7098/api/Category');
        setCategories(Array.isArray(cats) ? cats : []); // Gelen veri dizi mi kontrolü
      } catch {
        setCategories([]); // Hata olursa boş dizi
      } finally {
        setLoading(false); // Yükleme bitti
      }
    };
    fetchCategories();
  }, []);

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <h2 className="mb-4 fw-bold">Categories</h2>
      {loading ? (
        // Yükleniyorsa spinner göster
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <CSpinner color="primary" />
        </div>
      ) : categories.length === 0 ? (
        // Kategori yoksa bilgi mesajı
        <div className="text-center py-5 text-muted">No categories found.</div>
      ) : (
        // Kategoriler listeleniyor
        <CRow xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 3 }} lg={{ cols: 4 }} xl={{ cols: 5 }} className="g-4">
          {categories.map(cat => (
            <CCol key={cat.id}>
              <CCard className="h-100 category-card shadow-sm">
                <CCardImage 
                  src={cat.imageUrl
                    ? (cat.imageUrl.startsWith('http') ? cat.imageUrl : API_BASE + cat.imageUrl)
                    : '/images/default-category.jpg'}
                  alt={cat.name}
                  className="category-card-image"
                  onError={e => { e.target.src = '/images/default-category.jpg'; }}
                />
                <CCardBody className="d-flex flex-column justify-content-between">
                  <CCardTitle className="fw-semibold mb-2">{cat.name}</CCardTitle>
                  <CButton color="primary" variant="outline" onClick={() => navigate(`/products?category=${cat.id}`)}>
                    View Products
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