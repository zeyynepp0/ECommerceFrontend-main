import React, { useEffect, useState } from 'react';
import { apiGet, apiDelete, apiPost, apiPut } from '../../utils/api';
import {
  CContainer, CCard, CCardBody, CCardTitle, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormSelect
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

// isActive değerini normalize eden yardımcı fonksiyon
function normalizeIsActive(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val === 'true' || val === 'True' || val === '1';
  if (typeof val === 'number') return val === 1;
  return true; // default aktif
}

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'User' });
  const [adding, setAdding] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'passive'
  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    apiGet('https://localhost:7098/api/Admin/users')
      .then(data => {
        console.log('API kullanıcı verisi:', data); // API'den gelen veriyi konsola yazdır
        setUsers((data || []).map(u => ({
          ...u,
          isActive: normalizeIsActive(u.isActive)
        })));
      })
      .catch(() => setError('Users could not be loaded.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const user = users.find(u => u.id === id);
      await apiPut(`https://localhost:7098/api/User`, { ...user, isActive: false });
      fetchUsers();
    } catch {
      setError('User could not be deleted.');
    }
  };

  const handleActivate = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      await apiPut(`https://localhost:7098/api/User`, { ...user, isActive: true });
      fetchUsers();
    } catch {
      setError('User could not be activated.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      // fullName'i ayır
      const [firstName, ...lastNameArr] = form.fullName.split(' ');
      const lastName = lastNameArr.join(' ') || '';
      const payload = {
        firstName,
        lastName,
        email: form.email,
        passwordHash: form.password,
        phone: form.phone,
        role: form.role === 'Admin' ? 1 : 0,
        addresses: [],
        orders: [],
        reviews: [],
        isActive: true // Yeni kullanıcılar aktif olarak eklenir
      };
      const newUser = await apiPost('https://localhost:7098/api/Admin/users', payload);
      setUsers([...users, { ...newUser, isActive: !!newUser.isActive }]);
      setShowModal(false);
      setForm({ fullName: '', email: '', password: '', role: 'User' });
    } catch {
      setError('User could not be added.');
    } finally {
      setAdding(false);
    }
  };

  const filteredUsers = users.filter(user =>
    filter === 'all' ? true : filter === 'active' ? normalizeIsActive(user.isActive) : !normalizeIsActive(user.isActive)
  );

  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CCardTitle>Users</CCardTitle>
            <div>
              <CButton color={filter === 'all' ? 'secondary' : 'light'} className="me-2" onClick={() => setFilter('all')}>All</CButton>
              <CButton color={filter === 'active' ? 'success' : 'light'} className="me-2" onClick={() => setFilter('active')}>Show Active</CButton>
              <CButton color={filter === 'passive' ? 'danger' : 'light'} onClick={() => setFilter('passive')}>Show Passive</CButton>
              <CButton color="success" onClick={() => setShowModal(true)} className="ms-3">+ Add New User</CButton>
            </div>
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
                  <CTableHeaderCell>Full Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Address</CTableHeaderCell>
                  <CTableHeaderCell>Rol</CTableHeaderCell>
                  <CTableHeaderCell>Active?</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {(filteredUsers)
                  .map(user => (
                    <CTableRow key={user.id} style={{ cursor: 'pointer' }}>
                      <CTableDataCell>{user.id}</CTableDataCell>
                      <CTableDataCell>{(user.firstName || '') + ' ' + (user.lastName || '')}</CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>{user.addresses && user.addresses.length > 0 ? user.addresses[0].addressLine : '-'}</CTableDataCell>
                      <CTableDataCell>{user.role === 1 || user.role === 'Admin' ? 'Admin' : 'User'}</CTableDataCell>
                      <CTableDataCell>
                        {console.log('USER DEBUG:', user.id, user.isActive, normalizeIsActive(user.isActive))}
                        {normalizeIsActive(user.isActive) ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-danger">Passive</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {normalizeIsActive(user.isActive) ? (
                          <CButton color="warning" size="sm" variant="outline" className="me-2" onClick={e => { e.stopPropagation(); handleDelete(user.id); }}>
                            Make Passive
                          </CButton>
                        ) : (
                          <CButton color="success" size="sm" variant="outline" className="me-2" onClick={() => handleActivate(user.id)}>
                            Make Active
                          </CButton>
                        )}
                        <CButton color="info" size="sm" variant="outline" className="me-2" onClick={() => navigate(`/admin/users/${user.id}`)}>
                          Details / Edit
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader onClose={() => setShowModal(false)}>
          <CModalTitle>Add New User</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleAdd}>
          <CModalBody>
            <CFormInput className="mb-2" label="Full Name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            <CFormInput className="mb-2" label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <CFormInput className="mb-2" label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            <CFormSelect className="mb-2" label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </CFormSelect>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
            <CButton color="success" type="submit" disabled={adding}>{adding ? 'Adding...' : 'Add'}</CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CContainer>
  );
};
export default UsersPage;
