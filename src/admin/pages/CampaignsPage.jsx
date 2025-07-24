import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CContainer, CCard, CCardBody, CCardTitle, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormLabel, CFormCheck, CFormSelect
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5220/api/Campaign';
const PRODUCT_URL = 'http://localhost:5220/api/product';
const CATEGORY_URL = 'http://localhost:5220/api/category';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 0,
    percentage: '',
    amount: '',
    buyQuantity: '',
    payQuantity: '',
    minOrderAmount: '',
    startDate: '',
    endDate: '',
    isActive: true,
    productIds: [],
    categoryIds: []
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchCampaigns();
    fetchProductsAndCategories();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = res.data;
      setCampaigns(Array.isArray(data) ? data : (data && data.$values ? data.$values : []));
    } catch (err) {
      setError('Kampanyalar yüklenemedi.');
    }
    setLoading(false);
  };

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(PRODUCT_URL),
        axios.get(CATEGORY_URL)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      // ignore
    }
  };

  const handleShowModal = (campaign = null) => {
    if (campaign) {
      setEditId(campaign.id);
      setForm({
        name: campaign.name,
        description: campaign.description,
        type: campaign.type,
        percentage: campaign.percentage || '',
        amount: campaign.amount || '',
        buyQuantity: campaign.buyQuantity || '',
        payQuantity: campaign.payQuantity || '',
        minOrderAmount: campaign.minOrderAmount || '',
        startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : '',
        endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : '',
        isActive: campaign.isActive,
        productIds: Array.isArray(campaign.productIds) ? campaign.productIds.map(Number) : [],
        categoryIds: Array.isArray(campaign.categoryIds) ? campaign.categoryIds.map(Number) : []
      });
    } else {
      setEditId(null);
      setForm({
        name: '', description: '', type: 0, percentage: '', amount: '', buyQuantity: '', payQuantity: '', minOrderAmount: '', startDate: '', endDate: '', isActive: true, productIds: [], categoryIds: []
      });
    }
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name !== 'isActive') {
      // Checkboxlar için ayrı (ürün/kategori seçimleri)
      const [key, id] = name.split('_');
      setForm(f => {
        const arr = new Set(f[key]);
        if (checked) arr.add(Number(id));
        else arr.delete(Number(id));
        return { ...f, [key]: Array.from(arr) };
      });
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleAddOrUpdateCampaign = async e => {
    e.preventDefault();
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      alert('Bitiş tarihi, başlangıç tarihinden önce olamaz.');
      return;
    }
    setSaving(true);
    try {
      let payload = {
        name: form.name,
        description: form.description,
        type: Number(form.type),
        percentage: form.type == 0 ? Number(form.percentage) : null,
        amount: form.type == 1 ? Number(form.amount) : null,
        buyQuantity: form.type == 2 ? Number(form.buyQuantity) : null,
        payQuantity: form.type == 2 ? Number(form.payQuantity) : null,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        isActive: !!form.isActive,
        startDate: form.startDate,
        endDate: form.endDate || null,
        productIds: Array.isArray(form.productIds) ? form.productIds.map(Number) : [],
        categoryIds: Array.isArray(form.categoryIds) ? form.categoryIds.map(Number) : []
      };
      if (!editId) {
        await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        payload = { ...payload, id: editId };
        await axios.put(API_URL, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      fetchCampaigns();
      setShowModal(false);
    } catch (err) {
      alert('Kampanya kaydedilemedi.');
    }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('Kampanya silinsin mi?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchCampaigns();
    } catch {
      alert('Kampanya silinemedi.');
    }
  };

  const handleToggleActive = async c => {
    try {
      await axios.post(`${API_URL}/${c.id}/toggle-active`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchCampaigns();
    } catch {
      alert('İşlem başarısız.');
    }
  };

  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CCardTitle>Kampanyalar</CCardTitle>
            <CButton color="success" onClick={() => handleShowModal()} className="ms-3">+ Yeni Kampanya</CButton>
          </div>
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
                  <CTableHeaderCell>Açıklama</CTableHeaderCell>
                  <CTableHeaderCell>Tip</CTableHeaderCell>
                  <CTableHeaderCell>Aktif</CTableHeaderCell>
                  <CTableHeaderCell>Başlangıç</CTableHeaderCell>
                  <CTableHeaderCell>Bitiş</CTableHeaderCell>
                  <CTableHeaderCell>İşlemler</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {campaigns.map(c => (
                  <CTableRow key={c.id}>
                    <CTableDataCell>{c.id}</CTableDataCell>
                    <CTableDataCell>{c.name}</CTableDataCell>
                    <CTableDataCell>{c.description}</CTableDataCell>
                    <CTableDataCell>{c.type === 0 ? 'Yüzde İndirim' : c.type === 1 ? 'Tutar İndirimi' : '3 Al 2 Öde'}</CTableDataCell>
                    <CTableDataCell>
                      {c.isActive ? (
                        <span className="badge bg-success">Aktif</span>
                      ) : (
                        <span className="badge bg-danger">Pasif</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{c.startDate?.slice(0, 10)}</CTableDataCell>
                    <CTableDataCell>{c.endDate ? c.endDate.slice(0, 10) : '-'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" size="sm" variant="outline" className="me-2" onClick={() => handleShowModal(c)}>Düzenle</CButton>
                      <CButton color="danger" size="sm" variant="outline" className="me-2" onClick={() => handleDelete(c.id)}>Sil</CButton>
                      <CButton color={c.isActive ? 'warning' : 'success'} size="sm" variant="outline" className="me-2" onClick={() => handleToggleActive(c)}>{c.isActive ? 'Pasif Yap' : 'Aktif Yap'}</CButton>
                      <CButton color="secondary" size="sm" variant="outline" onClick={() => navigate(`/admin/campaigns/${c.id}`)}>Detay</CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
      <CModal visible={showModal} onClose={handleCloseModal} size="lg" alignment="center">
        <CModalHeader onClose={handleCloseModal}>
          <CModalTitle>{editId ? 'Kampanya Düzenle' : 'Kampanya Ekle'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleAddOrUpdateCampaign} className="row g-3">
          <CModalBody>
            <CFormLabel>Adı</CFormLabel>
            <CFormInput className="mb-2" name="name" value={form.name} onChange={handleFormChange} required />
            <CFormLabel>Açıklama</CFormLabel>
            <CFormInput className="mb-2" name="description" value={form.description} onChange={handleFormChange} />
            <CFormLabel>Tip</CFormLabel>
            <CFormSelect name="type" value={form.type} onChange={handleFormChange} required className="mb-2">
              <option value={0}>Yüzde İndirim</option>
              <option value={1}>Sabit Tutar İndirim</option>
              <option value={2}>3 Al 2 Öde</option>
            </CFormSelect>
            {form.type == 0 && (
              <>
                <CFormLabel>İndirim Oranı (%)</CFormLabel>
                <CFormInput className="mb-2" name="percentage" type="number" value={form.percentage} onChange={handleFormChange} required />
              </>
            )}
            {form.type == 1 && (
              <>
                <CFormLabel>İndirim Tutarı</CFormLabel>
                <CFormInput className="mb-2" name="amount" type="number" value={form.amount} onChange={handleFormChange} required />
              </>
            )}
            {form.type == 2 && (
              <div className="d-flex gap-2 mb-2">
                <div>
                  <CFormLabel>Al</CFormLabel>
                  <CFormInput name="buyQuantity" type="number" value={form.buyQuantity} onChange={handleFormChange} required style={{ width: 100 }} />
                </div>
                <div>
                  <CFormLabel>Öde</CFormLabel>
                  <CFormInput name="payQuantity" type="number" value={form.payQuantity} onChange={handleFormChange} required style={{ width: 100 }} />
                </div>
              </div>
            )}
            <CFormLabel>Minimum Tutar</CFormLabel>
            <CFormInput className="mb-2" name="minOrderAmount" type="number" value={form.minOrderAmount} onChange={handleFormChange} />
            <CFormLabel>Başlangıç Tarihi</CFormLabel>
            <CFormInput className="mb-2" name="startDate" type="date" value={form.startDate} min={today} onChange={handleFormChange} required />
            <CFormLabel>Bitiş Tarihi</CFormLabel>
            <CFormInput className="mb-2" name="endDate" type="date" value={form.endDate} min={form.startDate || today} onChange={handleFormChange} />
            <div className="mb-2">
              <CFormLabel>Aktif mi?</CFormLabel>
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleFormChange} style={{ marginLeft: 8 }} />
            </div>
            <div className="mb-2">
              <CFormLabel>Ürünler</CFormLabel>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
                {products.map(p => (
                  <CFormCheck
                    key={p.id}
                    type="checkbox"
                    name={`productIds_${p.id}`}
                    label={p.name}
                    checked={form.productIds.includes(p.id)}
                    onChange={handleFormChange}
                  />
                ))}
              </div>
            </div>
            <div className="mb-2">
              <CFormLabel>Kategoriler</CFormLabel>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
                {categories.map(c => (
                  <CFormCheck
                    key={c.id}
                    type="checkbox"
                    name={`categoryIds_${c.id}`}
                    label={c.name}
                    checked={form.categoryIds.includes(c.id)}
                    onChange={handleFormChange}
                  />
                ))}
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>İptal</CButton>
            <CButton color="success" type="submit" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CContainer>
  );
};

export default CampaignsPage; 