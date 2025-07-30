// Yorum ekleme/güncelleme formu bileşeni
import React, { useState, useEffect } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';
import { CCard, CCardBody, CCardTitle, CButton, CForm as CFormUI, CFormInput, CFormTextarea } from '@coreui/react';

const ReviewForm = ({ onSubmit, review }) => {
  // Yorum formu için puan, yorum ve isim state'leri
  const [rating, setRating] = useState(5); // Varsayılan puan 5
  const [comment, setComment] = useState(''); // Yorum metni
  const [name, setName] = useState(''); // Kullanıcı adı

  useEffect(() => {
    // Eğer düzenleme modundaysa mevcut yorumu doldur
    if (review) {
      setRating(review.rating); // Mevcut puan
      setComment(review.comment); // Mevcut yorum
      setName(review.userFullName || ''); // Mevcut kullanıcı adı
    }
  }, [review]);

  // Form gönderildiğinde çalışır
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rating, // Puan
      comment, // Yorum
      name, // Kullanıcı adı
      reviewId: review ? review.id : undefined, // Düzenleme ise id gönder
      isUpdate: !!review // Güncelleme mi?
    });
    setComment(''); // Yorum kutusunu temizle
    setName(''); // İsim kutusunu temizle
    setRating(5); // Puanı sıfırla
  };

  // Form arayüzü
  return (
    <CCard className="mb-3">
      <CCardBody>
        {/* Form başlığı */}
        <CCardTitle as="h5">{review ? 'Update Review' : 'Add Review'}</CCardTitle>
        <CFormUI onSubmit={handleSubmit}>
          {/* Kullanıcı adı inputu */}
          <CFormInput
            className="mb-3"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your Name (Optional)"
            disabled={!!review} // Düzenleme modunda isim değiştirilemez
          />
          {/* Puan seçimi */}
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
          {/* Yorum metni alanı */}
          <CFormTextarea
            className="mb-3"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Your thoughts about the product..."
            required
            rows={4}
          />
          {/* Gönder butonu */}
          <CButton type="submit" color="primary" className="w-100">
            <FiSend className="me-2" /> {review ? 'Update' : 'Submit'}
          </CButton>
        </CFormUI>
      </CCardBody>
    </CCard>
  );
};

export default ReviewForm;