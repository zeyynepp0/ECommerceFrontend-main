import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPut, apiPost } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CForm, CFormInput, CFormLabel, CButton, CAlert, CSpinner
} from '@coreui/react';

const EditCategoryPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5220";

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await apiGet(`http://localhost:5220/api/Category/${id}`);
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
        imgData.append('categoryName', form.name);
        const res = await apiPost('http://localhost:5220/api/Category/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      await apiPut(`http://localhost:5220/api/Category/update/${id}`, {
        ...form,
        imageUrl: imageUrl
      });
      navigate('/admin/categories');
    } catch (err) {
      setError('Category could not be updated.');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <CAlert color="danger">{error}</CAlert>;

  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 480 }}>
        <CCardBody>
          <CCardTitle>Update Category</CCardTitle>
          <CForm onSubmit={handleSubmit}>
            <CFormLabel>Category Name</CFormLabel>
            <CFormInput name="name" value={form.name} onChange={handleChange} required className="mb-3" />
            <CFormLabel>Current Image</CFormLabel>
            {form.imageUrl && <img src={form.imageUrl.startsWith('http') ? form.imageUrl : API_BASE + form.imageUrl} alt="Kategori" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} className="mb-3 d-block" />}
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