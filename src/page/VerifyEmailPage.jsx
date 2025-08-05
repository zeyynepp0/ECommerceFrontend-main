// E-posta doğrulama sayfası - Kullanıcı e-posta adresini doğrular
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CCard, CCardBody, CCardHeader, CAlert, CSpinner } from '@coreui/react';
import { apiPost, parseApiError } from '../utils/api';

// URL query parametrelerini almak için yardımcı fonksiyon
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const VerifyEmailPage = () => {
  // State ve yardımcı fonksiyonlar
  const [message, setMessage] = useState(''); // Başarı mesajı
  const [error, setError] = useState(''); // Hata mesajı
  const [loading, setLoading] = useState(true); // Yükleniyor mu?
  const navigate = useNavigate(); // Sayfa yönlendirme
  const query = useQuery(); // URL query
  const token = query.get('token') || ''; // Token parametresi

  // Sayfa yüklendiğinde e-posta doğrulama işlemini başlat
  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      try {
        const res = await apiPost('https://localhost:7098/api/User/verify-email', { token });
        setMessage(res.message || 'Your email address has been successfully verified.');
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

  // Sayfa arayüzü
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CCard style={{ minWidth: 380, maxWidth: 420, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff' }}>
        <CCardHeader className="text-center bg-transparent border-0 pb-0">
          <h3 className="fw-bold mb-1" style={{ color: '#6366f1' }}>Email Verification</h3>
        </CCardHeader>
        <CCardBody>
          {/* Yükleniyor, başarı ve hata mesajları */}
          {loading && <div className="text-center"><CSpinner color="primary" /></div>}
          {message && <CAlert color="success" className="py-2 text-center">{message}<br />You are being redirected to the Home Page...</CAlert>}
          {error && <CAlert color="danger" className="py-2 text-center">{error}</CAlert>}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default VerifyEmailPage; 