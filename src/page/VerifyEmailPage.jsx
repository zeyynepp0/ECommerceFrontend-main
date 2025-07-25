import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CCard, CCardBody, CCardHeader, CAlert, CSpinner } from '@coreui/react';
import { apiPost, parseApiError } from '../utils/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const VerifyEmailPage = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token') || '';

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      try {
        const res = await apiPost('https://localhost:7098/api/User/verify-email', { token });
        setMessage(res.message || 'E-posta adresiniz başarıyla doğrulandı.');
        setTimeout(() => navigate('/'), 2500);
      } catch (err) {
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (token) verify();
    else {
      setError('Doğrulama linki geçersiz.');
      setLoading(false);
    }
  }, [token, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 420, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff' }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}>E-posta Doğrulama</h3>
        </CCardHeader>
        <CCardBody>
          {loading && <div className="text-center"><CSpinner color="primary" /></div>}
          {message && <CAlert color="success" className="py-2 text-center">{message}<br />Anasayfaya yönlendiriliyorsunuz...</CAlert>}
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default VerifyEmailPage; 