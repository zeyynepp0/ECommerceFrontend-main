// Kayıt olma sayfası - Kullanıcı kaydı ve form validasyonu
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

// Kayıt formu validasyon şeması
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .matches(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s'-]+$/, 'Only letters and spaces allowed')
    .min(2, 'At least 2 characters required')
    .required('First name is required'),
  lastName: Yup.string()
    .matches(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s'-]+$/, 'Only letters and spaces allowed')
    .min(2, 'At least 2 characters required')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character')
    .required('Password is required'),
  birthDate: Yup.date()
    .max(new Date(), 'Birth date cannot be in the future')
    .test('age', 'You must be at least 18 years old', function(value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    })
    .required('Birth date is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits (without leading 0 or +90)')
    .required('Phone number is required'),
});

const RegisterPage = () => {
  // State ve yardımcı fonksiyonlar
  const [showPassword, setShowPassword] = useState(false); // Şifre görünürlüğü
  const [error, setError] = useState(''); // Hata mesajı
  const [isLoading, setIsLoading] = useState(false); // Yükleniyor mu?
  const navigate = useNavigate(); // Sayfa yönlendirme
  const dispatch = useDispatch(); // Redux dispatch
  const today = new Date().toISOString().split('T')[0]; // Bugünün tarihi (max doğum tarihi için)

  // Google ile giriş fonksiyonu (şu an pasif)
  const handleGoogleLogin = () => {
    // Google auth işlemi buraya entegre edilebilir
  };

  // Sayfa arayüzü
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 480, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff', color: undefined, border: undefined }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}><FiUserPlus /> Register</h3>
          <div className="text-muted mb-2">Create a new account</div>
        </CCardHeader>
        <CCardBody>
          {/* Hata mesajı */}
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
          {/* Google ile kayıt butonu */}
          <CButton color="light" className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2 border" onClick={handleGoogleLogin} type="button">
            <FcGoogle size={20} /> <span>Register with Google</span>
          </CButton>
          <div className="text-center text-muted mb-3" style={{ fontSize: 14 }}>or</div>
          {/* Formik ile form yönetimi */}
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
                await apiPost('https://localhost:7098/api/User', payload);
                // Kayıt başarılı, şimdi otomatik login
                const loginPayload = { Email: values.email.trim().toLowerCase(), Password: values.password };
                const loginResponse = await apiPost('https://localhost:7098/api/User/login', loginPayload);
                const token = loginResponse.token;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', token);
                const decoded = jwtDecode(token);
                const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid || decoded.sub || decoded.id || decoded.userId;
                const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
                if (!userId) {
                  setError('User ID could not be retrieved. Please log in again.');
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
                {/* Ad, soyad, e-posta, şifre, doğum tarihi, telefon alanları */}
                <div className="mb-3 position-relative">
                  <FiUser className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="text" name="firstName" placeholder="First Name" required className="form-control ps-5" />
                  <ErrorMessage name="firstName" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiUser className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="text" name="lastName" placeholder="Last Name" required className="form-control ps-5" />
                  <ErrorMessage name="lastName" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiMail className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="email" name="email" placeholder="Email" required className="form-control ps-5" />
                  <ErrorMessage name="email" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiLock className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" required className="form-control ps-5" />
                  <CButton type="button" color="light" size="sm" style={{ position: 'absolute', right: 8, top: 8, zIndex: 2 }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </CButton>
                  <ErrorMessage name="password" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiCalendar className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="date" name="birthDate" max={today} placeholder="Birth Date" required className="form-control ps-5" />
                  <ErrorMessage name="birthDate" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiPhoneCall className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type="tel" name="phone" placeholder="Phone" required className="form-control ps-5" />
                  <ErrorMessage name="phone" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                {/* Kayıt ol butonu */}
                <CButton type="submit" color="primary" className="w-100 fw-bold" disabled={isLoading || isSubmitting}>
                  {isLoading ? <CSpinner size="sm" /> : 'Register'}
                </CButton>
              </Form>
            )}
          </Formik>
          {/* Girişe yönlendirme linki */}
          <div className="text-center mt-3">
            Already have an account?
            <Link to="/login" className="ms-1 fw-semibold" style={{ color: '#6366f1' }}>Login</Link>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default RegisterPage;