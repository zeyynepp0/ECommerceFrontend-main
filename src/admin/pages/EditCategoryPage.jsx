// Kategori güncelleme sayfası - Kategori bilgilerini ve görselini günceller
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPut, apiPost } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CForm, CFormInput, CFormLabel, CButton, CAlert, CSpinner
} from '@coreui/react';

const EditCategoryPage = () => {
  // URL'den kategori id'sini al
  const { id } = useParams();
  // Form state'i (isim ve görsel url)
  const [form, setForm] = useState({
    name: '',
    imageUrl: ''
  });
  // Yüklenecek yeni görsel dosyası
  const [imageFile, setImageFile] = useState(null);
  // Hata mesajı için state
  const [error, setError] = useState('');
  // Yükleniyor durumu için state
  const [loading, setLoading] = useState(false);
  // Sayfa yönlendirme için hook
  const navigate = useNavigate();
  const API_BASE = "https://localhost:7098";

  // Sayfa yüklendiğinde mevcut kategori bilgisini backend'den çek
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await apiGet(`https://localhost:7098/api/Category/${id}`);
        setForm({
          name: category.name,
          imageUrl: category.imageUrl
        });
      } catch {
        setError('Category could not be loaded.');
      }
    };
    fetchCategory();
  }, [id]);

  // Form inputları değiştiğinde çalışır
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Yeni görsel seçildiğinde çalışır
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Form gönderildiğinde çalışır
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yeniden yüklenmesini engeller
    setError(''); // Hata mesajını temizle
    setLoading(true); // Yükleniyor durumunu başlat
    try {
      let imageUrl = form.imageUrl;
      // Eğer yeni görsel seçildiyse önce görseli yükle
      if (imageFile) {
        const imgData = new FormData();
        imgData.append('image', imageFile); // Görsel dosyasını ekle
        imgData.append('categoryName', form.name); // Kategori adını ekle
        // Görseli backend'e yükle ve dönen URL'yi al
        const res = await apiPost('https://localhost:7098/api/Category/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      // Kategori bilgisini backend'de güncelle
      await apiPut(`https://localhost:7098/api/Category/update/${id}`, {
        ...form,
        imageUrl: imageUrl
      });
      // Başarılıysa kategori listesine yönlendir
      navigate('/admin/categories');
    } catch (err) {
      setError('Category could not be updated.'); // Hata mesajı göster
    } finally {
      setLoading(false); // Yükleniyor durumunu kapat
    }
  };

  // Hata varsa göster
  if (error) return <CAlert color="danger">{error}</CAlert>;

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 480 }}>
        <CCardBody>
          <CCardTitle>Update Category</CCardTitle>
          {/* Kategori güncelleme formu */}
          <CForm onSubmit={handleSubmit}>
            <CFormLabel>Category Name</CFormLabel>
            <CFormInput name="name" value={form.name} onChange={handleChange} required className="mb-3" />
            <CFormLabel>Current Image</CFormLabel>
            {/* Mevcut görseli göster */}
            {form.imageUrl && <img src={form.imageUrl.startsWith('http') ? form.imageUrl : API_BASE + form.imageUrl} alt="Kategori" className="admin-form-preview-image" />}
            <CFormLabel>New Image (to change)</CFormLabel>
            <CFormInput type="file" accept="image/*" onChange={handleImageChange} className="mb-3" />
            <CButton type="submit" color="primary" disabled={loading}>{loading ? <CSpinner size="sm" /> : 'Update'}</CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default EditCategoryPage; 