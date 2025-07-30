// Ürün güncelleme sayfası - Ürün bilgilerini ve görselini günceller
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPut, apiPost } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CForm, CFormInput, CFormLabel, CButton, CAlert, CSpinner
} from '@coreui/react';

const EditProductPage = () => {
  // URL'den ürün id'sini al
  const { id } = useParams();
  // Kategori listesi ve form state'i
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
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

  // Sayfa yüklendiğinde ürün ve kategori verilerini backend'den çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [product, cats] = await Promise.all([
          apiGet(`https://localhost:7098/api/Product/${id}`),
          apiGet('https://localhost:7098/api/Category')
        ]);
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl
        });
        setCategories(cats);
      } catch {
        setError('Data could not be loaded.');
      }
    };
    fetchData();
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
        imgData.append('productName', form.name); // Ürün adını ekle
        // Görseli backend'e yükle ve dönen URL'yi al
        const res = await apiPost('https://localhost:7098/api/Product/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      // Ürün bilgisini backend'de güncelle
      await apiPut(`https://localhost:7098/api/Product/update/${id}`, {
        ...form,
        imageUrl: imageUrl
      });
      // Başarılıysa ürün listesine yönlendir
      navigate('/admin/products');
    } catch (err) {
      setError('Product could not be updated.'); // Hata mesajı göster
    } finally {
      setLoading(false); // Yükleniyor durumunu kapat
    }
  };

  // Hata varsa göster
  if (error) return <CAlert color="danger">{error}</CAlert>;

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 600 }}>
        <CCardBody>
          <CCardTitle>Update Product</CCardTitle>
          {/* Ürün güncelleme formu */}
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
            <CFormLabel>Current Image</CFormLabel>
            {/* Mevcut görseli göster */}
            {form.imageUrl && <img src={form.imageUrl.startsWith('http') ? form.imageUrl : API_BASE + form.imageUrl} alt="Ürün" className="admin-form-preview-image" />}
            <CFormLabel>New Image (to change)</CFormLabel>
            <CFormInput type="file" accept="image/*" onChange={handleImageChange} className="mb-3" />
            <CButton type="submit" color="primary" disabled={loading}>{loading ? <CSpinner size="sm" /> : 'Update'}</CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default EditProductPage; 