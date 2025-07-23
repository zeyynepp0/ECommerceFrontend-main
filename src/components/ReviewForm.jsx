import React, { useState, useEffect } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';
import { CCard, CCardBody, CCardTitle, CButton, CForm as CFormUI, CFormInput, CFormTextarea, CAlert } from '@coreui/react';

const ReviewForm = ({ onSubmit, review }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
      setName(review.userFullName || '');
    }
  }, [review]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rating,
      comment,
      name,
      reviewId: review ? review.id : undefined,
      isUpdate: !!review
    });
    setComment('');
    setName('');
    setRating(5);
  };

  return (
    <CCard className="mb-3">
      <CCardBody>
        <CCardTitle as="h5">{review ? 'Update Review' : 'Add Review'}</CCardTitle>
        <CFormUI onSubmit={handleSubmit}>
          <CFormInput
            className="mb-3"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your Name (Optional)"
            disabled={!!review}
          />
          <div className="mb-3">
            <label className="mb-1">Rating</label>
            <div>
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar
                  key={star}
                  fill={star <= rating ? '#FFD700' : 'none'}
                  color={star <= rating ? '#FFD700' : '#ccc'}
                  onClick={() => setRating(star)}
                  style={{ cursor: 'pointer', fontSize: 22 }}
                />
              ))}
            </div>
          </div>
          <CFormTextarea
            className="mb-3"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Your thoughts about the product..."
            required
            rows={4}
          />
          <CButton type="submit" color="primary" className="w-100">
            <FiSend className="me-2" /> {review ? 'Update' : 'Submit'}
          </CButton>
        </CFormUI>
      </CCardBody>
    </CCard>
  );
};

export default ReviewForm;