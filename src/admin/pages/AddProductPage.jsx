import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, apiGet } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CForm, CFormInput, CFormLabel, CButton, CAlert, CSpinner
} from '@coreui/react';

const AddProductPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet('https://localhost:7098/api/Category')
      .then(setCategories)
      .catch(() => setError('Categories could not be loaded.'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const imgData = new FormData();
        imgData.append('image', imageFile);
        imgData.append('productName', form.name);
        const res = await apiPost('https://localhost:7098/api/Product/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      await apiPost('https://localhost:7098/api/Product/add', {
        id: 0,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        categoryId: parseInt(form.categoryId, 10),
        imageUrl: imageUrl,
        isActive: true,
        rating: 0,
        reviewCount: 0,
        categoryName: ''
      });
      navigate('/admin/products');
    } catch (err) {
      const msg = err?.response?.data || 'Product could not be added.';
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 600 }}>
        <CCardBody>
          <CCardTitle>Add New Product</CCardTitle>
          {error && <CAlert color="danger">{error}</CAlert>}
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
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <CFormLabel>Product Image</CFormLabel>
            <CFormInput type="file" accept="image/*" onChange={handleImageChange} className="mb-3" />
            <CButton type="submit" color="primary" disabled={loading}>{loading ? <CSpinner size="sm" /> : 'Add'}</CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default AddProductPage;
