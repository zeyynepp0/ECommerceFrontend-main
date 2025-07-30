// Kargo şirketleri yönetim sayfası - Listeleme, ekleme, silme, aktif/pasif işlemleri
import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert, CFormInput, CFormSwitch, CModal, CModalHeader, CModalBody, CModalFooter, CFormLabel
} from '@coreui/react';

const initialForm = { name: '', price: '', freeShippingLimit: '', isActive: true };

const ShippingCompaniesPage = () => {
  // Kargo şirketleri ve durum state'leri
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  // Filtreleme state'i (tümü/aktif/pasif)
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'passive'

  // Kargo şirketlerini backend'den çek
  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet('/api/ShippingCompany');
      setCompanies(data);
    } catch {
      setError('Shipping companies could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde şirketleri çek
  useEffect(() => { fetchCompanies(); }, []);

  // Yeni şirket ekleme modalını aç
  const openAdd = () => { setForm(initialForm); setEditId(null); setModal(true); };
  // Şirket düzenleme modalını aç
  const openEdit = (company) => { setForm({ ...company }); setEditId(company.id); setModal(true); };
  // Modalı kapat
  const closeModal = () => { setModal(false); setForm(initialForm); setEditId(null); };

  // Şirket ekle/güncelle işlemi
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
      setError('Save operation failed: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  // Şirket silme işlemi
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipping company?')) return;
    setSaving(true);
    try {
      await apiDelete(`/api/ShippingCompany/${id}`);
      await fetchCompanies();
    } catch (e) {
      setError('Delete operation failed: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  // Şirket aktif/pasif işlemi
  const handleToggleActive = async (company) => {
    setSaving(true);
    try {
      await apiPut(`/api/ShippingCompany/${company.id}`, { ...company, isActive: !company.isActive });
      await fetchCompanies();
    } catch (e) {
      setError('Could not change active status: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  // Kargo şirketlerini filtrele (aktif/pasif/tümü)
  const filteredCompanies = companies.filter(company =>
    filter === 'all' ? true : filter === 'active' ? company.isActive : !company.isActive
  );
  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CCardTitle>Shipping Companies</CCardTitle>
            <div >
              {/* Filtre butonları */}
              <CButton color={filter === 'all' ? 'secondary' : 'light'} className="me-2" onClick={() => setFilter('all')}>All</CButton>
              <CButton color={filter === 'active' ? 'success' : 'light'} className="me-2" onClick={() => setFilter('active')}>Show Active</CButton>
              <CButton color={filter === 'passive' ? 'danger' : 'light'} onClick={() => setFilter('passive')}>Show Passive</CButton>
              {/* Yeni şirket ekle butonu */}
              <CButton color="success" className="ms-3" onClick={openAdd}>+ Add New Shipping Company</CButton>
            </div>
          </div>
          {/* Yükleniyor/hata/şirket tablosu */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Price (₺)</CTableHeaderCell>
                  <CTableHeaderCell>Free Shipping Limit (₺)</CTableHeaderCell>
                  <CTableHeaderCell>Active</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredCompanies.map(company => (
                  <CTableRow key={company.id}>
                    <CTableDataCell>{company.id}</CTableDataCell>
                    <CTableDataCell>{company.name}</CTableDataCell>
                    <CTableDataCell>{company.price}</CTableDataCell>
                    <CTableDataCell>{company.freeShippingLimit}</CTableDataCell>
                    {/* Aktif/pasif durumu */}
                    <CTableDataCell>
                      <span className={`badge ${company.isActive ? 'bg-success' : 'bg-danger'}`}>{company.isActive ? 'Active' : 'Passive'}</span>
                    </CTableDataCell>
                    {/* İşlem butonları */}
                    <CTableDataCell>
                      <CButton
                        color={company.isActive ? 'warning' : 'success'}
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(company)}
                        className="me-2"
                      >
                        {company.isActive ? 'Make Passive' : 'Make Active'}
                      </CButton>
                      <CButton size="sm" color="info" variant="outline" onClick={() => openEdit(company)}>
                        Edit
                      </CButton>
                      <CButton size="sm" color="danger" variant="outline" onClick={() => handleDelete(company.id)}>
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
      {/* Şirket ekle/düzenle modalı */}
      <CModal visible={modal} onClose={closeModal} backdrop="static">
        <CModalHeader onClose={closeModal}>{editId ? 'Edit Shipping Company' : 'Add New Shipping Company'}</CModalHeader>
        <CModalBody>
          <CFormLabel>Name</CFormLabel>
          <CFormInput className="mb-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <CFormLabel>Price (₺)</CFormLabel>
          <CFormInput className="mb-2" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min={0} />
          <CFormLabel>Free Shipping Limit (₺)</CFormLabel>
          <CFormInput className="mb-2" type="number" value={form.freeShippingLimit} onChange={e => setForm(f => ({ ...f, freeShippingLimit: e.target.value }))} required min={0} />
          <CFormLabel>Active</CFormLabel>
          <CFormSwitch className="mb-2" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} label={form.isActive ? 'Evet' : 'Hayır'} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>Cancel</CButton>
          <CButton color="success" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ShippingCompaniesPage; 