// Şifre sıfırlama sayfası - Kullanıcı yeni şifresini belirler
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CCard, CCardBody, CCardHeader, CButton, CAlert, CSpinner } from '@coreui/react';
import { FiLock, FiKey } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { apiPost, parseApiError } from '../utils/api';

// Şifre validasyon şeması
const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .matches(/[A-Z]/, 'En az bir büyük harf içermeli')
    .matches(/[a-z]/, 'En az bir küçük harf içermeli')
    .matches(/[0-9]/, 'En az bir rakam içermeli')
    .matches(/[^A-Za-z0-9]/, 'En az bir özel karakter içermeli')
    .required('Yeni şifre zorunludur'),
});

// URL query parametrelerini almak için yardımcı fonksiyon
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPasswordPage = () => {
  // State ve yardımcı fonksiyonlar
  const [success, setSuccess] = useState(''); // Başarı mesajı
  const [error, setError] = useState(''); // Hata mesajı
  const [isLoading, setIsLoading] = useState(false); // Yükleniyor mu?
  const navigate = useNavigate(); // Sayfa yönlendirme
  const query = useQuery(); // URL query
  const token = query.get('token') || ''; // Token parametresi

  // Sayfa arayüzü
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 420, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff' }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}><FiKey /> Şifre Sıfırla</h3>
          <div className="text-muted mb-2">Yeni şifrenizi belirleyin</div>
        </CCardHeader>
        <CCardBody>
          {/* Başarı ve hata mesajları */}
          {success && <CAlert color="success" className="py-2 text-center">{success}</CAlert>}
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
          {/* Formik ile form yönetimi */}
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
                {/* Yeni şifre inputu */}
                <div className="mb-3 position-relative">
                  <FiLock className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="password" name="newPassword" placeholder="Yeni Şifre" autoComplete="new-password" required className="form-control ps-5" />
                  <ErrorMessage name="newPassword" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                {/* Şifreyi sıfırla butonu */}
                <CButton type="submit" color="primary" className="w-100 fw-bold" disabled={isLoading || isSubmitting}>
                  {isLoading ? <CSpinner size="sm" /> : 'Şifreyi Sıfırla'}
                </CButton>
              </Form>
            )}
          </Formik>
          {/* Girişe dön linki */}
          <div className="text-center mt-3">
            <Link to="/login" className="fw-semibold" style={{ color: '#6366f1' }}>Girişe Dön</Link>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ResetPasswordPage; 