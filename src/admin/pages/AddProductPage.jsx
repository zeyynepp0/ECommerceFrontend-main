// Ürün ekleme sayfası - Yeni ürün ekleme ve görsel yükleme işlemleri
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, apiGet } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CForm, CFormInput, CFormLabel, CButton, CAlert, CSpinner
} from '@coreui/react';

const AddProductPage = () => {
  // Kategorileri tutan state
  const [categories, setCategories] = useState([]);
  // Ürün formu için state
  const [form, setForm] = useState({
    name: '', // Ürün adı
    description: '', // Ürün açıklaması
    price: '', // Ürün fiyatı
    stock: '', // Stok miktarı
    categoryId: '', // Kategori ID
    imageUrl: '' // Ürün görseli (URL olarak)
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

  // Sayfa yüklendiğinde kategorileri çek
  useEffect(() => {
    apiGet('https://localhost:7098/api/Category')
      .then(setCategories)
      .catch(() => setError('Categories could not be loaded.'));
  }, []);

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
        imgData.append('productName', form.name); // Ürün adını ekle
        // Görseli backend'e yükle ve dönen URL'yi al
        const res = await apiPost('https://localhost:7098/api/Product/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      // Ürünü backend'e ekle
      await apiPost('https://localhost:7098/api/Product/add', {
        id: 0, // Yeni ürün için id 0 gönderiliyor
        name: form.name,
        description: form.description,
        price: parseFloat(form.price), // Fiyatı sayıya çevir
        stock: parseInt(form.stock, 10), // Stok miktarını sayıya çevir
        categoryId: parseInt(form.categoryId, 10), // Kategori id'yi sayıya çevir
        imageUrl: imageUrl, // Görsel URL'sini ekle
        isActive: true, // Yeni ürün aktif olarak eklenir
        rating: 0, // Başlangıçta puan 0
        reviewCount: 0, // Başlangıçta yorum sayısı 0
        categoryName: '' // Kategori adı backend'den alınacak
      });
      // Başarılıysa ürün listesine yönlendir
      navigate('/admin/products');
    } catch (err) {
      const msg = err?.response?.data || 'Product could not be added.';
      setError(msg); // Hata mesajı göster
      alert(msg);
    } finally {
      setLoading(false); // Yükleniyor durumunu kapat
    }
  };

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 600 }}>
        <CCardBody>
          <CCardTitle>Add New Product</CCardTitle>
          {/* Hata varsa göster */}
          {error && <CAlert color="danger">{error}</CAlert>}
          {/* Ürün ekleme formu */}
          <CForm onSubmit={handleSubmit}>
            <CFormLabel>Product Name</CFormLabel>
            <CFormInput name="name" value={form.name} onChange={handleChange} required className="mb-3" />
            <CFormLabel>Description</CFormLabel>
            <CFormInput component="textarea" name="description" value={form.description} onChange={handleChange} required className="mb-3" />
            <CFormLabel>Price</CFormLabel>
            <CFormInput name="price" type="number" value={form.price} onChange={handleChange} required className="mb-3" />
            <CFormLabel>Stock</CFormLabel>
            <CFormInput name="stock" type="number" value={form.stock} onChange={handleChange} required className="mb-3" />
            <CFormLabel>Category</CFormLabel>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="form-select mb-3">
              <option value="">Select</option>
              {/* Kategori seçenekleri */}
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <CFormLabel>Product Image</CFormLabel>
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

export default AddProductPage;
