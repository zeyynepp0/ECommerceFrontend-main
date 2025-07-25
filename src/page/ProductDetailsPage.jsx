import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiHeart, 
  FiStar, 
  FiChevronLeft,
  FiShare2,
  FiTruck,
  FiCheckCircle,
  FiCreditCard,
  FiMinus,
  FiPlus,
  FiMessageSquare
} from 'react-icons/fi';
import axios from 'axios';
import ReviewForm from '../components/ReviewForm';
import ReviewItem from '../components/ReviewItem';
import '../css/ProductDetailsPage.css';
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları
import { addToCart, fetchCartFromBackend } from '../store/cartSlice'; // Sepet işlemleri
import { fetchFavorites, addFavorite, removeFavorite } from '../store/favoriteSlice'; // Favori işlemleri
import { apiGet, apiPost, apiPut, apiDelete, parseApiError } from '../utils/api'; // Ortak API fonksiyonları
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CButton, CBadge, CSpinner, CAlert
} from '@coreui/react';

const API_BASE = "https://localhost:7098";

const ProductDetailsPage = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Kullanıcı bilgilerini Redux store'dan alıyoruz
  const { userId, isLoggedIn } = useSelector(state => state.user);
  // Sepet verilerini Redux store'dan alıyoruz
  const { cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  // Favori verilerini Redux store'dan alıyoruz
  const { favorites } = useSelector(state => state.favorite);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const images = product?.imageUrl ? [product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl] : [];
  const mainImage = images[selectedImage] || (product?.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl) : '');

  // Ürün favori mi?
  const isFavorited = favorites.some(fav => fav.productId === parseInt(id));

  // Stok ve sepetteki miktar
  const stock = typeof product?.stock === 'number' ? product.stock : 0;
  // Sepetteki mevcut miktar
  const cartItem = cartItems.find(item => item.id === (product?.id || parseInt(id)));
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // useEffect ile ürün, ilgili ürünler ve yorumları çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, relatedRes, reviewsRes] = await Promise.all([
          apiGet(`https://localhost:7098/api/Product/${id}`),
          apiGet(`https://localhost:7098/api/Product/related/${id}`),
          apiGet(`https://localhost:7098/api/Review?productId=${id}`)
        ]);
        setProduct(productRes);
        setRelatedProducts(relatedRes || []);
        setReviews(reviewsRes || []);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        if (error.response?.status === 404) {
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  // Favori butonuna tıklanınca
  const handleFavoriteClick = async () => {
    if (!isLoggedIn) {
      alert('You must be logged in to add to favorites!');
      return;
    }
    setIsFavoriteLoading(true);
    try {
      if (isFavorited) {
        await dispatch(removeFavorite(parseInt(id)));
      } else {
        await dispatch(addFavorite(parseInt(id)));
      }
      await dispatch(fetchFavorites());
    } catch (error) {
      alert('Favorite operation failed!');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    // Sepetteki miktar + seçili miktar toplamı stoktan fazla olamaz
    const newValue = Math.max(1, Math.min(stock - cartQuantity, quantity + value));
    setQuantity(newValue);
  };

  // Sepete ekle butonuna tıklandığında çalışır
  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      alert('You must be logged in to add to cart!');
      return;
    }
    if (stock === 0) {
      alert('This product is out of stock!');
      return;
    }
    if (cartQuantity + quantity > stock) {
      alert(`Insufficient stock! You can add up to ${stock} of this product.`);
      return;
    }
    try {
      // Ortak API fonksiyonu ile backend'e sepete ekle
      await apiPost('https://localhost:7098/api/CartItem', {
        userId: userId,
        productId: product.id,
        quantity: quantity
      });
      // Redux ile frontend sepetine ekle
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.imageUrl,
        quantity: quantity
      }));
      // Sepeti backend'den güncelle
      dispatch(fetchCartFromBackend(userId));
      alert('Product added to cart!');
      // Sepet animasyonu için
      const cartButton = document.querySelector('.cart-notification');
      if (cartButton) {
        cartButton.classList.add('animate');
        setTimeout(() => cartButton.classList.remove('animate'), 1000);
      }
    } catch (error) {
      alert('Failed to add to cart! ' + parseApiError(error));
    }
  };

  // Yorum ekleme/güncelleme
  const handleReviewSubmit = async (reviewData) => {
    if (!isLoggedIn || !userId) {
      alert('You must be logged in to leave a review!');
      return;
    }
    if (!reviewData.comment || !reviewData.rating) {
      alert('Comment and rating are required!');
      return;
    }
    const payload = {
      productId: parseInt(id),
      userId: parseInt(userId),
      comment: reviewData.comment,
      rating: reviewData.rating
    };
    if (!payload.productId || !payload.userId || !payload.comment || !payload.rating) {
      alert('Missing or invalid data!');
      return;
    }
    try {
      console.log('Yorum gönder payload:', payload);
      if (reviewData.isUpdate && reviewData.reviewId) {
        // Güncelleme
        await apiPut(`https://localhost:7098/api/Review`, {
          id: reviewData.reviewId,
          content: reviewData.comment,
          rating: reviewData.rating,
          lastModifiedBy: 'user'
        });
        setReviews(reviews.map(r => r.id === reviewData.reviewId ? { ...r, comment: reviewData.comment, rating: reviewData.rating, lastModifiedBy: 'user', lastModifiedAt: new Date().toISOString() } : r));
      } else {
        // Ekleme
        const res = await apiPost(`https://localhost:7098/api/Review`, payload);
        setReviews([...reviews, res]);
      }
      setShowReviewForm(false);
      setEditingReview(null);
    } catch (err) {
      alert('Failed to submit review: ' + parseApiError(err));
    }
  };

  // Yorum silme
  const handleReviewDelete = async (review) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/Review/${review.id}?deletedBy=user`);
      setReviews(reviews.map(r => r.id === review.id ? { ...r, comment: 'This review has been deleted' } : r));
    } catch (err) {
      alert('Failed to delete review: ' + parseApiError(err));
    }
  };

  // Yorum düzenleme
  const handleReviewEdit = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  // Sadece o ürüne ait yorumlar
  const filteredReviews = reviews.filter(r => r.productId === parseInt(id));

  if (loading) {
    return (
      <div className={`product-details-page ${darkMode ? 'dark' : ''}`}>
        <div className="product-details-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`product-details-page ${darkMode ? 'dark' : ''}`}>
        <div className="product-details-container">
          <div className="product-not-found">
            <h2>Product Not Found</h2>
            <p>The product you are looking for does not exist or may have been removed.</p>
            <button onClick={() => navigate('/products')} className="back-to-products">
              Back to All Products
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (product && product.isActive === false) {
    return (
      <div className={`product-details-page ${darkMode ? 'dark' : ''}`}>
        <div className="product-details-container">
          <div className="product-not-found">
            <h2>Product Not Active</h2>
            <p>This product is not currently for sale.</p>
            <button onClick={() => navigate('/products')} className="back-to-products">
              Back to All Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CContainer fluid className={`py-4 product-details-page${darkMode ? ' dark' : ''}`} style={darkMode ? { background: '#18181b', color: '#f3f4f6' } : {}}>
      <CRow>
        <CCol md={6} className="mb-4">
          <CCard className={`h-100 p-3 d-flex align-items-center justify-content-center${darkMode ? ' dark-card' : ''}`} style={darkMode ? { background: '#23232a', color: '#f3f4f6', border: '1px solid #33343b' } : {}}>
            <div className="main-image mb-3" style={{ width: '100%', textAlign: 'center' }}>
              <img
                src={mainImage || '/images/default-product.jpg'}
                alt={product.name}
                style={{ maxWidth: 340, maxHeight: 340, objectFit: 'contain', borderRadius: 12 }}
                onError={e => { e.target.src = '/images/default-product.jpg'; }}
              />
            </div>
            {images.length > 1 && (
              <div className="d-flex gap-2 justify-content-center mb-2">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img || '/images/default-product.jpg'}
                    alt={`${product.name} ${index + 1}`}
                    className={`rounded ${selectedImage === index ? 'border border-primary' : ''}`}
                    style={{ width: 48, height: 48, objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setSelectedImage(index)}
                    onError={e => { e.target.src = '/images/default-product.jpg'; }}
                  />
                ))}
              </div>
            )}
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className={`h-100 p-4${darkMode ? ' dark-card' : ''}`} style={darkMode ? { background: '#23232a', color: '#f3f4f6', border: '1px solid #33343b' } : {}}>
            <CCardTitle className="fs-2 mb-2">{product.name}</CCardTitle>
            <div className="mb-2 text-muted">Category: {product.category?.name || 'No Category'}</div>
            <div className="mb-2 d-flex align-items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} fill={i < Math.floor(product.rating || 0) ? '#FFD700' : 'none'} color={i < Math.floor(product.rating || 0) ? '#FFD700' : '#ccc'} />
              ))}
              <span>({product.rating || 0}) {product.reviewCount || 0} Reviews</span>
            </div>
            <div className="mb-2">
              <CBadge color={stock === 0 ? 'secondary' : 'success'}>{stock === 0 ? 'Out of Stock' : 'In Stock'}</CBadge>
              {product.discount > 0 && (
                <CBadge color="danger" className="ms-2">%{product.discount} Discount</CBadge>
              )}
            </div>
            <div className="mb-2 fs-3 fw-bold">
              {(product.price || 0).toFixed(2)}₺
              {product.originalPrice && (
                <span className="text-muted ms-2 text-decoration-line-through fs-5">{product.originalPrice.toFixed(2)}₺</span>
              )}
            </div>
            <div className="mb-3 text-muted">SKU: {product.sku || 'N/A'}</div>
            <CCardText className="mb-3">
              <strong>Product Description:</strong>
              <br />
              {product.description}
            </CCardText>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="quantity-selector d-flex align-items-center gap-2">
                <CButton color="light" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</CButton>
                <span className="fs-5 px-2">{quantity}</span>
                <CButton color="light" size="sm" onClick={() => handleQuantityChange(1)} disabled={quantity >= (stock - cartQuantity)}>+</CButton>
              </div>
              <CButton color="primary" onClick={handleAddToCart} disabled={stock === 0 || (cartQuantity + quantity > stock)}>
                <FiShoppingCart className="me-2" />{stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </CButton>
              <CButton color={isFavorited ? 'danger' : 'light'} variant={isFavorited ? '' : 'outline'} onClick={handleFavoriteClick} disabled={isFavoriteLoading}>
                <FiHeart className="me-1" />{isFavorited ? 'Favorited' : 'Add to Favorites'}
              </CButton>
            </div>
          </CCard>
        </CCol>
      </CRow>
      {/* Yorumlar */}
      <CRow className="mt-4">
        <CCol md={8}>
          <CCard className={`mb-4${darkMode ? ' dark-card' : ''}`} style={darkMode ? { background: '#23232a', color: '#f3f4f6', border: '1px solid #33343b' } : {}}>
            <CCardBody>
              <CCardTitle className="mb-3">User Reviews ({filteredReviews.length})</CCardTitle>
              <div className="mb-3">
                <CButton color={darkMode ? 'dark' : 'secondary'} size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </CButton>
              </div>
              {showReviewForm && (
                <ReviewForm onSubmit={handleReviewSubmit} darkMode={darkMode} review={editingReview} />
              )}
              {filteredReviews && filteredReviews.length > 0 ? (
                <div className="reviews-list">
                  {filteredReviews.map(review => (
                    <ReviewItem
                      key={review.id}
                      review={review}
                      darkMode={darkMode}
                      isOwn={isLoggedIn && review.userId === userId}
                      onEdit={handleReviewEdit}
                      onDelete={handleReviewDelete}
                    />
                  ))}
                </div>
              ) : (
                <CAlert color={darkMode ? 'dark' : 'info'}>No reviews yet</CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        {/* Benzer Ürünler */}
        <CCol md={4}>
          {relatedProducts && relatedProducts.length > 0 && (
            <CCard className={`mb-4${darkMode ? ' dark-card' : ''}`} style={darkMode ? { background: '#23232a', color: '#f3f4f6', border: '1px solid #33343b' } : {}}>
              <CCardBody>
                <CCardTitle>Related Products</CCardTitle>
                <CRow className="g-2">
                  {relatedProducts.map(product => (
                    <CCol xs={12} key={product.id}>
                      <CCard className={`mb-2 p-2${darkMode ? ' dark-card' : ''}`} style={darkMode ? { background: '#23232a', color: '#f3f4f6', border: '1px solid #33343b' } : {}}>
                        <Link to={`/products/${product.id}`} className="d-flex align-items-center gap-2 text-decoration-none">
                          <img
                            src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE + product.imageUrl) : '/images/default-product.jpg'}
                            alt={product.name}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, background: darkMode ? '#18181b' : '#fff' }}
                            onError={e => { e.target.src = '/images/default-product.jpg'; }}
                          />
                          <div>
                            <div className="fw-bold">{product.name}</div>
                            <div className="text-muted">{(product.price || 0).toFixed(2)}₺</div>
                          </div>
                        </Link>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ProductDetailsPage;