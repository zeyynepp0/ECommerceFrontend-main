import React, { useEffect, useState } from 'react';
import { apiGet } from '../../utils/api';
import { CContainer, CCard, CCardBody, CCardTitle, CCardText, CSpinner, CAlert, CFormSelect, CRow, CCol } from '@coreui/react';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // Son 5 yıl
const months = [
  { value: '', label: 'Tümü' },
  { value: 1, label: 'Ocak' }, { value: 2, label: 'Şubat' }, { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' }, { value: 5, label: 'Mayıs' }, { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' }, { value: 8, label: 'Ağustos' }, { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' }, { value: 11, label: 'Kasım' }, { value: 12, label: 'Aralık' }
];

const RevenuePage = () => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchRevenue = () => {
    setLoading(true);
    setError('');
    let url = `http://localhost:5220/api/Admin/revenue?period=${selectedMonth ? 'month' : 'year'}&year=${selectedYear}`;
    if (selectedMonth) url += `&month=${selectedMonth}`;
    apiGet(url)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRevenue(data[0]);
        else setError('Gelir raporu bulunamadı.');
      })
      .catch(() => setError('Gelir raporu yüklenemedi.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRevenue();
  }, [selectedYear, selectedMonth]);

  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 480 }}>
        <CCardBody>
          <CCardTitle>Gelir Raporu</CCardTitle>
          <CRow className="mb-3">
            <CCol>
              <CFormSelect value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </CFormSelect>
            </CCol>
            <CCol>
              <CFormSelect value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </CFormSelect>
            </CCol>
          </CRow>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : revenue ? (
            <>
              <CCardText>Dönem: <strong>{selectedMonth ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}` : `${selectedYear} (Tüm Yıl)`}</strong></CCardText>
              <CCardText>Rapor Aralığı: <strong>{revenue.startDate ? new Date(revenue.startDate).toLocaleDateString() : '-'} - {revenue.endDate ? new Date(revenue.endDate).toLocaleDateString() : '-'}</strong></CCardText>
              <hr />
              <CCardText className="mb-2"><span className="fw-bold">Toplam Gelir:</span> <span className="text-success fw-bold">{revenue.totalRevenue?.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></CCardText>
              <CCardText className="mb-2"><span className="fw-bold">İptal Edilen Tutarlar:</span> <span className="text-danger fw-bold">{revenue.cancelledRevenue?.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></CCardText>
              <CCardText className="mb-2"><span className="fw-bold">İade Edilen Tutarlar:</span> <span className="text-warning fw-bold">{revenue.refundedRevenue?.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></CCardText>
              <CCardText className="mb-2"><span className="fw-bold">Toplam Sipariş:</span> <span>{revenue.orderCount}</span></CCardText>
            </>
          ) : null}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default RevenuePage; 