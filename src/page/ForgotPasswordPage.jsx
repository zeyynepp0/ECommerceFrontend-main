import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CAlert, CSpinner } from '@coreui/react';
import { FiMail, FiKey } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { apiPost, parseApiError } from '../utils/api';
import { Link } from 'react-router-dom';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Geçerli bir e-posta giriniz').required('E-posta zorunludur'),
});

const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 420, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff' }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}><FiKey /> Şifremi Unuttum</h3>
          <div className="text-muted mb-2">E-posta adresinizi girin, sıfırlama bağlantısı gönderelim</div>
        </CCardHeader>
        <CCardBody>
          {success && <CAlert color="success" className="py-2 text-center">{success}</CAlert>}
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setIsLoading(true);
              setError('');
              setSuccess('');
              setToken('');
              try {
                const res = await apiPost('http://localhost:5220/api/User/forgot-password', { email: values.email });
                setSuccess(res.message || 'Sıfırlama bağlantısı e-posta adresinize gönderildi.');
                if (res.token) setToken(res.token); // Demo amaçlı token göster
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
                  <FiMail className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="email" name="email" placeholder="E-posta" autoComplete="username" required className="form-control ps-5" />
                  <ErrorMessage name="email" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <CButton type="submit" color="primary" className="w-100 fw-bold" disabled={isLoading || isSubmitting}>
                  {isLoading ? <CSpinner size="sm" /> : 'Sıfırlama Bağlantısı Gönder'}
                </CButton>
              </Form>
            )}
          </Formik>
          {token && (
            <div className="alert alert-info mt-3" style={{ fontSize: 13 }}>
              <b>Demo Token:</b> {token}
              <br />
              <Link to={`/reset-password?token=${token}`}>Şifreyi Sıfırla</Link>
            </div>
          )}
          <div className="text-center mt-3">
            <Link to="/login" className="fw-semibold" style={{ color: '#6366f1' }}>Girişe Dön</Link>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ForgotPasswordPage; 