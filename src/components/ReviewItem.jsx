import React from 'react';
import { FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { CCard, CCardBody, CCardTitle, CButton, CBadge } from '@coreui/react';

const ReviewItem = ({ review, isOwn, onEdit, onDelete }) => {
  const isDeleted = review.comment === 'Bu yorum silinmiştir';
  return (
    <CCard className={`mb-3 ${isDeleted ? 'bg-light' : ''}`}>
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span className="fw-bold">{review.userFullName || 'Anonim Kullanıcı'}</span>
            <span className="text-muted ms-2" style={{ fontSize: 13 }}>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          <div>
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                fill={i < review.rating ? '#FFD700' : 'none'}
                color={i < review.rating ? '#FFD700' : '#ccc'}
              />
            ))}
          </div>
          {isOwn && !isDeleted && (
            <div className="d-flex gap-2">
              <CButton size="sm" color="info" variant="outline" onClick={() => onEdit(review)} title="Düzenle"><FiEdit2 /></CButton>
              <CButton size="sm" color="danger" variant="outline" onClick={() => onDelete(review)} title="Sil"><FiTrash2 /></CButton>
            </div>
          )}
        </div>
        <div>
          <div className={isDeleted ? 'text-muted fst-italic' : ''}>
            {isDeleted ? 'Bu yorum silinmiştir' : review.comment}
          </div>
          {review.lastModifiedBy && review.lastModifiedAt && !isDeleted && (
            <div className="mt-1 text-muted" style={{ fontSize: 12 }}>
              ({review.lastModifiedBy === 'admin' ? 'Admin' : 'Kullanıcı'} tarafından {new Date(review.lastModifiedAt).toLocaleDateString('tr-TR')} tarihinde değiştirildi)
            </div>
          )}
        </div>
      </CCardBody>
    </CCard>
  );
};

export default ReviewItem;