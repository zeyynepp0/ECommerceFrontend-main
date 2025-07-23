import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CForm, CFormInput, CFormLabel, CButton, CAlert, CSpinner
} from '@coreui/react';

const AddCategoryPage = () => {
  const [form, setForm] = useState({
    name: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        imgData.append('categoryName', form.name);
        const res = await apiPost('http://localhost:5220/api/Category/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      await apiPost('http://localhost:5220/api/Category/add', {
        ...form,
        imageUrl: imageUrl
      });
      navigate('/admin/categories');
    } catch (err) {
      setError('Category could not be added.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 480 }}>
        <CCardBody>
          <CCardTitle>Add New Category</CCardTitle>
          {error && <CAlert color="danger">{error}</CAlert>}
          <CForm onSubmit={handleSubmit}>
            <CFormLabel>Category Name</CFormLabel>
            <CFormInput name="name" value={form.name} onChange={handleChange} required className="mb-3" />
            <CFormLabel>Category Image</CFormLabel>
            <CFormInput type="file" accept="image/*" onChange={handleImageChange} className="mb-3" />
            <CButton type="submit" color="primary" disabled={loading}>{loading ? <CSpinner size="sm" /> : 'Add'}</CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default AddCategoryPage; 