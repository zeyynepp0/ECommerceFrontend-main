import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CCard, CCardBody, CCardHeader, CButton, CAlert, CSpinner } from '@coreui/react';
import { FiLock, FiKey } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { apiPost, parseApiError } from '../utils/api';

const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .matches(/[A-Z]/, 'En az bir büyük harf içermeli')
    .matches(/[a-z]/, 'En az bir küçük harf içermeli')
    .matches(/[0-9]/, 'En az bir rakam içermeli')
    .matches(/[^A-Za-z0-9]/, 'En az bir özel karakter içermeli')
    .required('Yeni şifre zorunludur'),
});

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPasswordPage = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token') || '';

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 420, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff' }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}><FiKey /> Şifre Sıfırla</h3>
          <div className="text-muted mb-2">Yeni şifrenizi belirleyin</div>
        </CCardHeader>
        <CCardBody>
          {success && <CAlert color="success" className="py-2 text-center">{success}</CAlert>}
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
          <Formik
            initialValues={{ newPassword: '' }}
            validationSchema={ResetPasswordSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setIsLoading(true);
              setError('');
              setSuccess('');
              try {
                await apiPost('https://localhost:7098/api/User/reset-password', { token, newPassword: values.newPassword });
                setSuccess('Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...');
                setTimeout(() => navigate('/login'), 2000);
              } catch (err) {
                setError(parseApiError(err));
              } finally {
                setIsLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="mb-2">
                <div className="mb-3 position-relative">
                  <FiLock className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="password" name="newPassword" placeholder="Yeni Şifre" autoComplete="new-password" required className="form-control ps-5" />
                  <ErrorMessage name="newPassword" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <CButton type="submit" color="primary" className="w-100 fw-bold" disabled={isLoading || isSubmitting}>
                  {isLoading ? <CSpinner size="sm" /> : 'Şifreyi Sıfırla'}
                </CButton>
              </Form>
            )}
          </Formik>
          <div className="text-center mt-3">
            <Link to="/login" className="fw-semibold" style={{ color: '#6366f1' }}>Girişe Dön</Link>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ResetPasswordPage; 