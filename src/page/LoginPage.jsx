import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import { jwtDecode } from 'jwt-decode';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { apiPost, apiGet, parseApiError } from '../utils/api';
import {
  CCard, CCardBody, CCardHeader, CButton, CAlert, CSpinner
} from '@coreui/react';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Geçerli bir e-posta giriniz').required('E-posta gereklidir'),
  password: Yup.string().min(6, 'Şifre en az 6 karakter olmalı').required('Şifre gereklidir'),
});

const LoginPage = ({ darkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = () => {
    // Google auth işlemi buraya entegre edilebilir
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: darkMode ? '#18181b' : '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 420, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}><FiLogIn /> Giriş Yap</h3>
          <div className="text-muted mb-2">Hesabınıza giriş yapın</div>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
          <CButton color="light" className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2 border" onClick={handleGoogleLogin} type="button">
            <FcGoogle size={20} /> <span>Google ile Giriş Yap</span>
          </CButton>
          <div className="text-center text-muted mb-3" style={{ fontSize: 14 }}>veya</div>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setIsLoading(true);
              setError('');
              try {
                // Önce user login dene
                const loginUrl = 'http://localhost:5220/api/User/login';
                const payload = { Email: values.email.trim().toLowerCase(), Password: values.password };
                let response;
                let userData;
                try {
                  response = await apiPost(loginUrl, payload);
                  // Kullanıcı detayını çek
                  const decoded = jwtDecode(response.token);
                  const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid || decoded.sub || decoded.id || decoded.userId;
                  userData = await apiGet('http://localhost:5220/api/User/' + userId);
                } catch (userLoginError) {
                  // Eğer user login başarısız ve email tam olarak admin@mail.com ise admin login dene
                  if (values.email.trim().toLowerCase() === 'admin@mail.com') {
                    response = await apiPost('http://localhost:5220/api/Admin/login', payload);
                  } else {
                    throw userLoginError;
                  }
                }
                // Eğer user login ise ve userData varsa, aktiflik kontrolü yap
                if (userData && userData.isActive === false) {
                  setError('Hesabınız pasif durumda. Lütfen sayfa yöneticisi ile iletişime geçin.');
                  setIsLoading(false);
                  setSubmitting(false);
                  return;
                }
                const token = response.token;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', token);
                const decoded = jwtDecode(token);
                const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid || decoded.sub || decoded.id || decoded.userId;
                const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
                if (!userId) {
                  setError('Kullanıcı ID alınamadı. Lütfen tekrar deneyin.');
                  setIsLoading(false);
                  setSubmitting(false);
                  return;
                }
                localStorage.setItem('userId', userId);
                localStorage.setItem('role', role);
                dispatch(login({ userId: userId, token: token }));
                if (role === 'Admin') {
                  navigate('/admin');
                } else {
                  navigate(`/profile/${userId}`);
                }
              } catch (error) {
                setError(parseApiError(error));
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
                <div className="mb-3 position-relative">
                  <FiLock className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type={showPassword ? 'text' : 'password'} name="password" placeholder="Şifre" autoComplete="current-password" required className="form-control ps-5" />
                  <CButton type="button" color="light" size="sm" style={{ position: 'absolute', right: 8, top: 8, zIndex: 2 }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </CButton>
                  <ErrorMessage name="password" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <CButton type="submit" color="primary" className="w-100 fw-bold" disabled={isLoading || isSubmitting}>
                  {isLoading ? <CSpinner size="sm" /> : 'Giriş Yap'}
                </CButton>
              </Form>
            )}
          </Formik>
          <div className="text-center mt-3">
            Hesabınız yok mu?
            <Link to="/register" className="ms-1 fw-semibold" style={{ color: '#6366f1' }}>Kayıt Ol</Link>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default LoginPage;
