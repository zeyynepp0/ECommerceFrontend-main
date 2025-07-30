// Kategori ekleme sayfası - Yeni kategori ekleme ve görsel yükleme işlemleri
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CForm, CFormInput, CFormLabel, CButton, CAlert, CSpinner
} from '@coreui/react';

const AddCategoryPage = () => {
  // Kategori formu için state
  const [form, setForm] = useState({
    name: '', // Kategori adı
    imageUrl: '' // Kategori görseli (URL olarak)
  });
  // Yüklenecek dosya için state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  // Hata mesajı için state
  const [error, setError] = useState('');
  // Yükleniyor durumunu tutan state
  const [loading, setLoading] = useState(false);
  // Sayfa yönlendirme için hook
  const navigate = useNavigate();

  // Formdaki inputlar değiştiğinde çalışır
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Görsel dosyası seçildiğinde çalışır
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Önceki preview URL'yi temizle
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      // Yeni preview URL oluştur
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Component unmount olduğunda URL'yi temizle
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Form gönderildiğinde çalışır
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yeniden yüklenmesini engeller
    setError(''); // Hata mesajını temizle
    setLoading(true); // Yükleniyor durumunu başlat
    try {
      let imageUrl = '';
      // Eğer görsel seçildiyse önce görseli yükle
      if (imageFile) {
        const imgData = new FormData();
        imgData.append('image', imageFile); // Görsel dosyasını ekle
        imgData.append('categoryName', form.name); // Kategori adını ekle
        // Görseli backend'e yükle ve dönen URL'yi al
        const res = await apiPost('https://localhost:7098/api/Category/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      // Kategoriyi backend'e ekle
      await apiPost('https://localhost:7098/api/Category/add', {
        ...form,
        imageUrl: imageUrl // Görsel URL'sini ekle
      });
      // Başarılıysa kategori listesine yönlendir
      navigate('/admin/categories');
    } catch (err) {
      setError('Category could not be added.'); // Hata mesajı göster
    } finally {
      setLoading(false); // Yükleniyor durumunu kapat
    }
  };

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 480 }}>
        <CCardBody>
          <CCardTitle>Add New Category</CCardTitle>
          {/* Hata varsa göster */}
          {error && <CAlert color="danger">{error}</CAlert>}
          {/* Kategori ekleme formu */}
          <CForm onSubmit={handleSubmit}>
            <CFormLabel>Category Name</CFormLabel>
            <CFormInput name="name" value={form.name} onChange={handleChange} required className="mb-3" />
            <CFormLabel>Category Image</CFormLabel>
            <CFormInput type="file" accept="image/*" onChange={handleImageChange} className="mb-3" />
            {/* Seçilen resim önizlemesi */}
            {imagePreview && (
              <div className="mb-3">
                <CFormLabel>Image Preview:</CFormLabel>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="admin-form-preview-image"
                />
              </div>
            )}
            <CButton type="submit" color="primary" disabled={loading}>{loading ? <CSpinner size="sm" /> : 'Add'}</CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default AddCategoryPage; 