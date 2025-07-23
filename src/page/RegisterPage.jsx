import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiPhoneCall, FiCalendar, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { apiPost, parseApiError } from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import {
  CCard, CCardBody, CCardHeader, CButton, CAlert, CSpinner
} from '@coreui/react';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Adınız en az 2 karakter olmalı')
    .required('Adınız gereklidir'),
  lastName: Yup.string()
    .min(2, 'Soyadınız en az 2 karakter olmalı')
    .required('Soyadınız gereklidir'),
  email: Yup.string()
    .email('Geçerli bir e-posta giriniz')
    .required('E-posta gereklidir'),
  password: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalı')
    .required('Şifre gereklidir'),
  birthDate: Yup.date()
    .max(new Date(), 'Doğum tarihi ileri bir tarih olamaz')
    .required('Doğum tarihi gereklidir'),
  phone: Yup.string()
    .matches(/^\d{10}$/, 'Telefon numarası geçersiz. Başında 0 veya +90 olmadan 10 haneli girin.')
    .required('Telefon numarası gereklidir'),
});

const RegisterPage = ({ darkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = new Date().toISOString().split('T')[0];

  const handleGoogleLogin = () => {
    // Google auth işlemi buraya entegre edilebilir
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: darkMode ? '#18181b' : '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 480, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}><FiUserPlus /> Kayıt Ol</h3>
          <div className="text-muted mb-2">Yeni hesap oluşturun</div>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
          <CButton color="light" className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2 border" onClick={handleGoogleLogin} type="button">
            <FcGoogle size={20} /> <span>Google ile Kayıt Ol</span>
          </CButton>
          <div className="text-center text-muted mb-3" style={{ fontSize: 14 }}>veya</div>
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              birthDate: '',
              phone: ''
            }}
            validationSchema={RegisterSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setIsLoading(true);
              setError('');
              try {
                // FormData yerine düz JS objesi ile gönder
                const payload = {
                  firstName: values.firstName.trim(),
                  lastName: values.lastName.trim(),
                  email: values.email.trim().toLowerCase(),
                  passwordHash: values.password,
                  phone: values.phone,
                  birthDate: values.birthDate,
                  addresses: [],
                  orders: [],
                  reviews: []
                };
                await apiPost('http://localhost:5220/api/User', payload);
                // Kayıt başarılı, şimdi otomatik login
                const loginPayload = { Email: values.email.trim().toLowerCase(), Password: values.password };
                const loginResponse = await apiPost('http://localhost:5220/api/User/login', loginPayload);
                const token = loginResponse.token;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', token);
                const decoded = jwtDecode(token);
                const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid || decoded.sub || decoded.id || decoded.userId;
                const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
                if (!userId) {
                  setError('Kullanıcı ID alınamadı. Lütfen tekrar giriş yapın.');
                  setIsLoading(false);
                  setSubmitting(false);
                  return;
                }
                localStorage.setItem('userId', userId);
                localStorage.setItem('role', role);
                dispatch(login({ userId: userId, token: token }));
                navigate(`/profile/${userId}`);
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
                  <FiUser className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="text" name="firstName" placeholder="Adınız" required className="form-control ps-5" />
                  <ErrorMessage name="firstName" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiUser className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="text" name="lastName" placeholder="Soyadınız" required className="form-control ps-5" />
                  <ErrorMessage name="lastName" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiMail className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="email" name="email" placeholder="E-posta" required className="form-control ps-5" />
                  <ErrorMessage name="email" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiLock className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type={showPassword ? 'text' : 'password'} name="password" placeholder="Şifre" required className="form-control ps-5" />
                  <CButton type="button" color="light" size="sm" style={{ position: 'absolute', right: 8, top: 8, zIndex: 2 }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </CButton>
                  <ErrorMessage name="password" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiCalendar className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="date" name="birthDate" max={today} placeholder="Doğum Tarihi" required className="form-control ps-5" />
                  <ErrorMessage name="birthDate" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiPhoneCall className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="tel" name="phone" placeholder="Telefon" required className="form-control ps-5" />
                  <ErrorMessage name="phone" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <CButton type="submit" color="primary" className="w-100 fw-bold" disabled={isLoading || isSubmitting}>
                  {isLoading ? <CSpinner size="sm" /> : 'Kayıt Ol'}
                </CButton>
              </Form>
            )}
          </Formik>
          <div className="text-center mt-3">
            Zaten hesabınız var mı?
            <Link to="/login" className="ms-1 fw-semibold" style={{ color: '#6366f1' }}>Giriş Yap</Link>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default RegisterPage;