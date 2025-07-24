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
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = () => {
    // Google auth işlemi buraya entegre edilebilir
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 420, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff', color: undefined, border: undefined }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}><FiLogIn /> Login</h3>
          <div className="text-muted mb-2">Sign in to your account</div>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
          {info && <CAlert color="info" className="py-2 text-center">{info}</CAlert>}
          <CButton color="light" className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2 border" onClick={handleGoogleLogin} type="button">
            <FcGoogle size={20} /> <span>Sign in with Google</span>
          </CButton>
          <div className="text-center text-muted mb-3" style={{ fontSize: 14 }}>or</div>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setIsLoading(true);
              setError('');
              setInfo('');
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
                  setError('Your account is inactive. Please contact the site administrator.');
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
                  setError('User ID could not be retrieved. Please try again.');
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
                const msg = parseApiError(error);
                if (msg && (msg.toLowerCase().includes('verification link') || msg.toLowerCase().includes('not verified') || msg.toLowerCase().includes('doğrulama linki') || msg.toLowerCase().includes('doğrulanmamış'))) {
                  setInfo(msg || 'A verification link has been sent to your email address.');
                  setError('');
                } else if (msg && (msg.toLowerCase().includes('invalid email') || msg.toLowerCase().includes('wrong password') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('geçersiz e-posta') || msg.toLowerCase().includes('şifre yanlış') || msg.toLowerCase().includes('şifre'))) {
                  setError('Invalid email or password.');
                  setInfo('');
                } else if (msg && (msg.toLowerCase().includes('user not found') || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('kayıtlı kullanıcı bulunamadı') || msg.toLowerCase().includes('bulunamadı'))) {
                  setError('No user found with this email address.');
                  setInfo('');
                } else if (msg && (msg.toLowerCase().includes('inactive') || msg.toLowerCase().includes('passive') || msg.toLowerCase().includes('pasif'))) {
                  setError('Your account is inactive. Please contact the site administrator.');
                  setInfo('');
                } else if (msg) {
                  setError(msg);
                  setInfo('');
                } else {
                  setError('An unknown error occurred.');
                  setInfo('');
                }
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
                  <Field type="email" name="email" placeholder="Email" autoComplete="username" required className="form-control ps-5" />
                  <ErrorMessage name="email" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <div className="mb-3 position-relative">
                  <FiLock className="position-absolute" style={{ left: 12, top: 14, opacity: 0.6 }} />
                  <Field type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" autoComplete="current-password" required className="form-control ps-5" />
                  <CButton type="button" color="light" size="sm" style={{ position: 'absolute', right: 8, top: 8, zIndex: 2 }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </CButton>
                  <ErrorMessage name="password" component="div" className="text-danger small ms-1 mt-1" />
                </div>
                <CButton type="submit" color="primary" className="w-100 fw-bold" disabled={isLoading || isSubmitting}>
                  {isLoading ? <CSpinner size="sm" /> : 'Login'}
                </CButton>
              </Form>
            )}
          </Formik>
          <div className="text-center mt-3">
            Don't have an account?
            <Link to="/register" className="ms-1 fw-semibold" style={{ color: '#6366f1' }}>Register</Link>
          </div>
          <div className="text-center mt-2">
            <Link to="/forgot-password" className="fw-semibold" style={{ color: '#6366f1', fontSize: 14 }}>Şifremi Unuttum?</Link>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default LoginPage;
