// Gelir raporu sayfası - Yıllık/aylık gelir, iptal ve iade tutarları, toplam sipariş sayısı
import React, { useEffect, useState } from 'react';
import { apiGet } from '../../utils/api';
import { CContainer, CCard, CCardBody, CCardTitle, CCardText, CSpinner, CAlert, CFormSelect, CRow, CCol } from '@coreui/react';

// Son 5 yıl için yıl seçenekleri
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // Son 5 yıl
// Ay seçenekleri
const months = [
  { value: '', label: 'All' },
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

const RevenuePage = () => {
  // Gelir verisi ve durum state'leri
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Seçili yıl ve ay state'i
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Gelir verisini backend'den çek
  const fetchRevenue = () => {
    setLoading(true);
    setError('');
    let url = `https://localhost:7098/api/Admin/revenue?period=${selectedMonth ? 'month' : 'year'}&year=${selectedYear}`;
    if (selectedMonth) url += `&month=${selectedMonth}`;
    apiGet(url)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRevenue(data[0]);
        else setError('Revenue report not found.');
      })
      .catch(() => setError('Revenue report could not be loaded.'))
      .finally(() => setLoading(false));
  };

  // Yıl veya ay değiştiğinde veriyi güncelle
  useEffect(() => {
    fetchRevenue();
  }, [selectedYear, selectedMonth]);

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard className="mx-auto" style={{ maxWidth: 480 }}>
        <CCardBody>
          <CCardTitle>Revenue Report</CCardTitle>
          {/* Yıl ve ay seçim alanları */}
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
          {/* Yükleniyor/hata/rapor */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : revenue ? (
            <>
              <CCardText>Period: <strong>{selectedMonth ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}` : `${selectedYear} (Full Year)`}</strong></CCardText>
              <CCardText>Report Range: <strong>{revenue.startDate ? new Date(revenue.startDate).toLocaleDateString() : '-'} - {revenue.endDate ? new Date(revenue.endDate).toLocaleDateString() : '-'}</strong></CCardText>
              <hr />
              <CCardText className="mb-2"><span className="fw-bold">Total Revenue:</span> <span className="text-success fw-bold">{revenue.totalRevenue?.toLocaleString('en-US', {minimumFractionDigits:2})} ₺</span></CCardText>
              <CCardText className="mb-2"><span className="fw-bold">Cancelled Amounts:</span> <span className="text-danger fw-bold">{revenue.cancelledRevenue?.toLocaleString('en-US', {minimumFractionDigits:2})} ₺</span></CCardText>
              <CCardText className="mb-2"><span className="fw-bold">Refunded Amounts:</span> <span className="text-warning fw-bold">{revenue.refundedRevenue?.toLocaleString('en-US', {minimumFractionDigits:2})} ₺</span></CCardText>
              <CCardText className="mb-2"><span className="fw-bold">Total Orders:</span> <span>{revenue.orderCount}</span></CCardText>
            </>
          ) : null}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default RevenuePage; 