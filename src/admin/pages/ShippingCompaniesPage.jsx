import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert, CFormInput, CFormSwitch, CModal, CModalHeader, CModalBody, CModalFooter, CFormLabel
} from '@coreui/react';

const initialForm = { name: '', price: '', freeShippingLimit: '', isActive: true };

const ShippingCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'passive'

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet('/api/ShippingCompany');
      setCompanies(data);
    } catch {
      setError('Kargo firmaları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const openAdd = () => { setForm(initialForm); setEditId(null); setModal(true); };
  const openEdit = (company) => { setForm({ ...company }); setEditId(company.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm(initialForm); setEditId(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await apiPut(`/api/ShippingCompany/${editId}`, form);
      } else {
        await apiPost('/api/ShippingCompany', form);
      }
      await fetchCompanies();
      closeModal();
    } catch (e) {
      setError('Kayıt işlemi başarısız: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Kargo firması silinsin mi?')) return;
    setSaving(true);
    try {
      await apiDelete(`/api/ShippingCompany/${id}`);
      await fetchCompanies();
    } catch (e) {
      setError('Silme işlemi başarısız: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (company) => {
    setSaving(true);
    try {
      await apiPut(`/api/ShippingCompany/${company.id}`, { ...company, isActive: !company.isActive });
      await fetchCompanies();
    } catch (e) {
      setError('Aktiflik durumu değiştirilemedi: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    filter === 'all' ? true : filter === 'active' ? company.isActive : !company.isActive
  );

  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <CCardTitle>Kargo Firmaları</CCardTitle>
          <div className="mb-3">
            <CButton color={filter === 'all' ? 'secondary' : 'light'} className="me-2" onClick={() => setFilter('all')}>Tümü</CButton>
            <CButton color={filter === 'active' ? 'success' : 'light'} className="me-2" onClick={() => setFilter('active')}>Aktifleri Göster</CButton>
            <CButton color={filter === 'passive' ? 'danger' : 'light'} onClick={() => setFilter('passive')}>Pasifleri Göster</CButton>
          </div>
          <CButton color="success" className="mb-3" onClick={openAdd}>Yeni Kargo Firması Ekle</CButton>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Adı</CTableHeaderCell>
                  <CTableHeaderCell>Ücret (₺)</CTableHeaderCell>
                  <CTableHeaderCell>Ücretsiz Kargo Limiti (₺)</CTableHeaderCell>
                  <CTableHeaderCell>Aktif</CTableHeaderCell>
                  <CTableHeaderCell>İşlemler</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredCompanies.map(company => (
                  <CTableRow key={company.id}>
                    <CTableDataCell>{company.id}</CTableDataCell>
                    <CTableDataCell>{company.name}</CTableDataCell>
                    <CTableDataCell>{company.price}</CTableDataCell>
                    <CTableDataCell>{company.freeShippingLimit}</CTableDataCell>
                    <CTableDataCell>
                      <span className={`badge ${company.isActive ? 'bg-success' : 'bg-danger'}`}>{company.isActive ? 'Aktif' : 'Pasif'}</span>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color={company.isActive ? 'warning' : 'success'}
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(company)}
                        className="me-2"
                      >
                        {company.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                      </CButton>
                      <CButton size="sm" color="info" variant="outline" onClick={() => openEdit(company)}>
                        Düzenle
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
      <CModal visible={modal} onClose={closeModal} backdrop="static">
        <CModalHeader onClose={closeModal}>{editId ? 'Kargo Firması Düzenle' : 'Yeni Kargo Firması'}</CModalHeader>
        <CModalBody>
          <CFormLabel>Adı</CFormLabel>
          <CFormInput className="mb-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <CFormLabel>Ücret (₺)</CFormLabel>
          <CFormInput className="mb-2" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min={0} />
          <CFormLabel>Ücretsiz Kargo Limiti (₺)</CFormLabel>
          <CFormInput className="mb-2" type="number" value={form.freeShippingLimit} onChange={e => setForm(f => ({ ...f, freeShippingLimit: e.target.value }))} required min={0} />
          <CFormLabel>Aktif</CFormLabel>
          <CFormSwitch className="mb-2" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} label={form.isActive ? 'Evet' : 'Hayır'} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>İptal</CButton>
          <CButton color="success" onClick={handleSave} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ShippingCompaniesPage; 