// Yorum yönetim sayfası - Yorum listeleme, düzenleme, silme işlemleri
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

const API_BASE = "https://localhost:7098";

// Yorum düzenleme validasyon şeması
const ReviewEditSchema = Yup.object().shape({
  comment: Yup.string().required('Review cannot be empty'),
  rating: Yup.number().min(1).max(5).required('Rating is required'),
});

const ReviewsPage = () => {
  // Yorumlar ve durum state'leri
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [showEditFormId, setShowEditFormId] = useState(null);
  const navigate = useNavigate();

  // Sayfa yüklendiğinde yorumları backend'den çek
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        let data = await apiGet('https://localhost:7098/api/Review?includeDeleted=true');
        // Eksik alanları tamamla (ürün ve kullanıcı bilgileri)
        data = await Promise.all(data.map(async review => {
          let productImageUrl = review.productImageUrl;
          let productName = review.productName;
          if (!productImageUrl || !productName) {
            try {
              const product = await apiGet(`https://localhost:7098/api/Product/${review.productId}`);
              productImageUrl = product.imageUrl;
              productName = product.name;
            } catch {}
          }
          let userAvatarUrl = review.userAvatarUrl;
          let userEmail = review.userEmail;
          if (!userAvatarUrl || !userEmail) {
            try {
              const user = await apiGet(`https://localhost:7098/api/User/${review.userId}`);
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
        setError('Reviews could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Yorum silme işlemi
  const handleDelete = async (review) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/Review/${review.id}?deletedBy=admin`);
      setReviews(reviews.map(r => r.id === review.id ? { ...r, comment: 'This review has been deleted' } : r));
    } catch {
      setError('Review could not be deleted.');
    }
  };

  // Yorum düzenleme formunu aç
  const handleEdit = (review) => {
    setEditingReview(review);
    setShowEditFormId(review.id);
  };

  // Yorum düzenleme formu gönderildiğinde çalışır
  const handleEditSubmit = async (data) => {
    try {
      await apiPut(`https://localhost:7098/api/Review`, {
        id: data.reviewId,
        content: data.comment,
        rating: data.rating,
        lastModifiedBy: 'admin'
      });
      setReviews(reviews.map(r => r.id === data.reviewId ? { ...r, comment: data.comment, rating: data.rating, lastModifiedBy: 'admin', lastModifiedAt: new Date().toISOString() } : r));
      setShowEditFormId(null);
      setEditingReview(null);
    } catch (err) {
      setError('Review could not be updated: ' + parseApiError(err));
    }
  };

  // Sayfa arayüzü
  return (
    <CContainer className="py-4">
      <CCard>
        <CCardBody>
          <CCardTitle>Reviews</CCardTitle>
          {/* Yükleniyor/hata/yorum tablosu */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <CTableHeaderCell>Product</CTableHeaderCell>
                  <CTableHeaderCell>Review</CTableHeaderCell>
                  <CTableHeaderCell>Rating</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {reviews.map(review => (
                  <CTableRow key={review.id} className={review.comment === 'This review has been deleted' || review.comment === 'Bu yorum silinmiştir' ? 'table-danger' : ''}>
                    <CTableDataCell>{review.id}</CTableDataCell>
                    <CTableDataCell>
                      {/* Kullanıcı bilgisi ve avatar */}
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
                      {/* Ürün bilgisi ve görseli */}
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
                              await apiDelete(`https://localhost:7098/api/Product/delete/${review.productId}`);
                              window.location.reload();
                            } catch {
                              alert('Ürün silinemedi.');
                            }
                          }
                        }} title="Sil Ürün"><FiTrash2 /></CButton>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {/* Yorum düzenleme formu veya yorum metni */}
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
                        <span style={{ textDecoration: 'line-through', color: '#dc3545' }}>{review.originalComment || 'This review has been deleted'}</span>
                      ) : (
                        <>
                          {review.comment}
                          {review.lastModifiedBy && review.lastModifiedAt && review.comment !== 'Bu yorum silinmiştir' && (
                            <span className="review-modified-info">
                              <br/>
                              ({review.lastModifiedBy === 'admin' ? 'Admin' : 'User'} modified on {new Date(review.lastModifiedAt).toLocaleDateString()})
                            </span>
                          )}
                        </>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{review.rating}</CTableDataCell>
                    <CTableDataCell>
                      {/* Yorum için düzenle/sil butonları */}
                      {review.comment !== 'This review has been deleted' && review.comment !== 'Bu yorum silinmiştir' && (
                        <>
                          <CButton color="primary" size="sm" variant="outline" className="me-2" onClick={() => { setEditingReview(review); setShowEditFormId(review.id); }}>Edit</CButton>
                          <CButton color="danger" size="sm" variant="outline" onClick={() => handleDelete(review)}>Delete</CButton>
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
