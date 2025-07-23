import React, { useEffect, useState } from 'react';
import { apiGet, apiDelete, apiPut, parseApiError } from '../../utils/api';
import ReviewForm from '../../components/ReviewForm';
import {
  CContainer, CCard, CCardBody, CCardTitle, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CAlert, CImage
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const API_BASE = "http://localhost:5220";

const ReviewEditSchema = Yup.object().shape({
  comment: Yup.string().required('Yorum boş olamaz'),
  rating: Yup.number().min(1).max(5).required('Puan gerekli'),
});

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [showEditFormId, setShowEditFormId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        let data = await apiGet('http://localhost:5220/api/Review?includeDeleted=true');
        // Eksik alanları tamamla
        data = await Promise.all(data.map(async review => {
          let productImageUrl = review.productImageUrl;
          let productName = review.productName;
          if (!productImageUrl || !productName) {
            try {
              const product = await apiGet(`http://localhost:5220/api/Product/${review.productId}`);
              productImageUrl = product.imageUrl;
              productName = product.name;
            } catch {}
          }
          let userAvatarUrl = review.userAvatarUrl;
          let userEmail = review.userEmail;
          if (!userAvatarUrl || !userEmail) {
            try {
              const user = await apiGet(`http://localhost:5220/api/User/${review.userId}`);
              userAvatarUrl = user.avatarUrl;
              userEmail = user.email;
            } catch {}
          }
          return {
            ...review,
            productImageUrl,
            productName,
            userAvatarUrl,
            userEmail
          };
        }));
        setReviews(data);
      } catch {
        setError('Yorumlar yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);
  const handleDelete = async (review) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    try {
      await apiDelete(`http://localhost:5220/api/Review/${review.id}?deletedBy=admin`);
      setReviews(reviews.map(r => r.id === review.id ? { ...r, comment: 'Bu yorum silinmiştir' } : r));
    } catch {
      setError('Yorum silinemedi.');
    }
  };
  const handleEdit = (review) => {
    setEditingReview(review);
    setShowEditFormId(review.id);
  };
  const handleEditSubmit = async (data) => {
    try {
      await apiPut(`http://localhost:5220/api/Review`, {
        id: data.reviewId,
        content: data.comment,
        rating: data.rating,
        lastModifiedBy: 'admin'
      });
      setReviews(reviews.map(r => r.id === data.reviewId ? { ...r, comment: data.comment, rating: data.rating, lastModifiedBy: 'admin', lastModifiedAt: new Date().toISOString() } : r));
      setShowEditFormId(null);
      setEditingReview(null);
    } catch (err) {
      setError('Yorum güncellenemedi: ' + parseApiError(err));
    }
  };
  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <CCardTitle>Yorumlar</CCardTitle>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Kullanıcı</CTableHeaderCell>
                  <CTableHeaderCell>Ürün</CTableHeaderCell>
                  <CTableHeaderCell>Yorum</CTableHeaderCell>
                  <CTableHeaderCell>Puan</CTableHeaderCell>
                  <CTableHeaderCell>İşlemler</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {reviews.map(review => (
                  <CTableRow key={review.id} className={review.comment === 'Bu yorum silinmiştir' ? 'table-danger' : ''}>
                    <CTableDataCell>{review.id}</CTableDataCell>
                    <CTableDataCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CImage
                          src={review.userAvatarUrl ? (review.userAvatarUrl.startsWith('http') ? review.userAvatarUrl : API_BASE + review.userAvatarUrl) : '/images/default-category.jpg'}
                          alt={review.userEmail}
                          width={32}
                          height={32}
                          style={{ objectFit: 'cover', borderRadius: '50%', cursor: 'pointer' }}
                          onClick={() => navigate(`/admin/users/${review.userId}`)}
                        />
                        <span style={{ color: '#0d6efd', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate(`/admin/users/${review.userId}`)}>{review.userEmail}</span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CImage
                          src={review.productImageUrl ? (review.productImageUrl.startsWith('http') ? review.productImageUrl : API_BASE + review.productImageUrl) : '/images/default-product.jpg'}
                          alt={review.productName}
                          width={40}
                          height={40}
                          style={{ objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${review.productId}`)}
                        />
                        <span style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }} onClick={() => navigate(`/products/${review.productId}`)}>{review.productName}</span>
                        <CButton color="primary" size="sm" variant="ghost" className="ms-2" onClick={() => navigate(`/admin/products/edit/${review.productId}`)} title="Düzenle Ürün"><FiEdit2 /></CButton>
                        <CButton color="danger" size="sm" variant="ghost" onClick={async () => {
                          if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
                            try {
                              await apiDelete(`http://localhost:5220/api/Product/delete/${review.productId}`);
                              window.location.reload();
                            } catch {
                              alert('Ürün silinemedi.');
                            }
                          }
                        }} title="Sil Ürün"><FiTrash2 /></CButton>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {showEditFormId === review.id ? (
                        <Formik
                          initialValues={{ comment: review.comment, rating: review.rating, reviewId: review.id }}
                          validationSchema={ReviewEditSchema}
                          onSubmit={handleEditSubmit}
                        >
                          {({ isSubmitting, values, handleChange }) => (
                            <Form>
                              <div className="mb-2">
                                <Field as="textarea" name="comment" className="form-control" rows={2} value={values.comment} onChange={handleChange} />
                                <ErrorMessage name="comment" component="div" className="text-danger small" />
                              </div>
                              <div className="mb-2">
                                <Field as="select" name="rating" className="form-select" value={values.rating} onChange={handleChange}>
                                  <option value={1}>1</option>
                                  <option value={2}>2</option>
                                  <option value={3}>3</option>
                                  <option value={4}>4</option>
                                  <option value={5}>5</option>
                                </Field>
                                <ErrorMessage name="rating" component="div" className="text-danger small" />
                              </div>
                              <div className="d-flex gap-2">
                                <CButton type="submit" color="primary" size="sm" disabled={isSubmitting}>{isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</CButton>
                                <CButton type="button" color="secondary" size="sm" variant="outline" onClick={() => { setShowEditFormId(null); setEditingReview(null); }}>İptal</CButton>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      ) : review.comment === 'Bu yorum silinmiştir' ? (
                        <span style={{ textDecoration: 'line-through', color: '#dc3545' }}>{review.originalComment || review.comment}</span>
                      ) : (
                        <>
                          {review.comment}
                          {review.lastModifiedBy && review.lastModifiedAt && review.comment !== 'Bu yorum silinmiştir' && (
                            <span className="review-modified-info">
                              <br/>
                              ({review.lastModifiedBy === 'admin' ? 'Admin' : 'Kullanıcı'} tarafından {new Date(review.lastModifiedAt).toLocaleDateString('tr-TR')} tarihinde değiştirildi)
                            </span>
                          )}
                        </>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{review.rating}</CTableDataCell>
                    <CTableDataCell>
                      {review.comment !== 'Bu yorum silinmiştir' && (
                        <>
                          <CButton color="primary" size="sm" variant="outline" className="me-2" onClick={() => { setEditingReview(review); setShowEditFormId(review.id); }}>Düzenle</CButton>
                          <CButton color="danger" size="sm" variant="outline" onClick={() => handleDelete(review)}>Sil</CButton>
                        </>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};
export default ReviewsPage;
