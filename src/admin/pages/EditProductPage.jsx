import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPut, apiPost } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CForm, CFormInput, CFormLabel, CButton, CAlert, CSpinner
} from '@coreui/react';

const EditProductPage = () => {
  const { id } = useParams();
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
  const API_BASE = "http://localhost:5220";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [product, cats] = await Promise.all([
          apiGet(`http://localhost:5220/api/Product/${id}`),
          apiGet('http://localhost:5220/api/Category')
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
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const imgData = new FormData();
        imgData.append('image', imageFile);
        imgData.append('productName', form.name);
        const res = await apiPost('http://localhost:5220/api/Product/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      await apiPut(`http://localhost:5220/api/Product/update/${id}`, {
        ...form,
        imageUrl: imageUrl
      });
      navigate('/admin/products');
    } catch (err) {
      setError('Product could not be updated.');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <CAlert color="danger">{error}</CAlert>;

  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 600 }}>
        <CCardBody>
          <CCardTitle>Update Product</CCardTitle>
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
            <CFormLabel>Current Image</CFormLabel>
            {form.imageUrl && <img src={form.imageUrl.startsWith('http') ? form.imageUrl : API_BASE + form.imageUrl} alt="Ürün" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} className="mb-3 d-block" />}
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