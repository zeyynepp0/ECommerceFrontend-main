import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, fetchCartFromBackend } from '../store/cartSlice';
import { fetchFavorites, addFavorite, removeFavorite } from '../store/favoriteSlice';
import { apiPost } from '../utils/api';
import { CCard, CCardBody, CCardTitle, CButton, CBadge, CSpinner } from '@coreui/react';

const ProductCard = ({ product, onFavoriteChange }) => {
  const { userId, isLoggedIn } = useSelector(state => state.user);
  const { cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const { favorites } = useSelector(state => state.favorite);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const price = typeof product.price === 'number' ? product.price : null;
  const discount = typeof product.discount === 'number' ? product.discount : null;
  const stock = typeof product.stock === 'number' ? product.stock : 0;

  const hasValidDiscount = price !== null && discount !== null && discount > price;
  const discountPercent = hasValidDiscount
    ? Math.round((1 - price / discount) * 100)
    : null;

  const isFavorited = favorites.some(fav => fav.productId === product.id);
  const cartItem = cartItems.find(item => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('You must be logged in to add to favorites!');
      return;
    }
    setIsLoading(true);
    try {
      if (isFavorited) {
        await dispatch(removeFavorite(product.id));
      } else {
        await dispatch(addFavorite(product.id));
      }
      await dispatch(fetchFavorites());
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      alert('Favorite operation failed!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('You must be logged in to add to cart!');
      return;
    }
    if (stock === 0) {
      alert('This product is out of stock!');
      return;
    }
    if (cartQuantity >= stock) {
      alert(`Insufficient stock! You can add up to ${stock} of this product.`);
      return;
    }
    setIsAddingToCart(true);
    try {
      await apiPost('https://localhost:7098/api/CartItem', {
        userId: userId,
        productId: product.id,
        quantity: 1
      });
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.imageUrl,
        quantity: 1
      }));
      dispatch(fetchCartFromBackend(userId));
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add to cart! ' + error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <CCard className="h-100 position-relative">
      {hasValidDiscount && (
        <CBadge color="danger" className="position-absolute top-0 end-0 m-2">%{discountPercent}</CBadge>
      )}
      <CButton
        color={isFavorited ? 'danger' : 'light'}
        variant={isFavorited ? '' : 'outline'}
        size="sm"
        className="position-absolute top-0 start-0 m-2 rounded-circle"
        style={{ zIndex: 2 }}
        onClick={handleFavoriteClick}
        disabled={isLoading}
      >
        <FiHeart size={18} fill={isFavorited ? '#e74c3c' : 'none'} />
      </CButton>
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
        <img
          src={product.imageUrl || product.image || '/images/default-product.jpg'}
          alt={product.name}
          style={{ width: '100%', height: 180, objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8, background: '#fff' }}
          onError={e => { e.target.src = '/images/default-product.jpg'; }}
        />
      </Link>
      <CCardBody>
        <div className="mb-1 text-muted" style={{ fontSize: 13, color: '#a1a1aa' }}>{product.categoryName || 'No Category'}</div>
        <CCardTitle style={{ fontSize: 18, minHeight: 40 }}>
          <Link to={`/products/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.name || 'No Product Name'}</Link>
        </CCardTitle>
        <div className="mb-2 d-flex align-items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              fill={i < Math.floor(product.rating || 0) ? '#FFD700' : 'none'}
              color={i < Math.floor(product.rating || 0) ? '#FFD700' : '#ccc'}
            />
          ))}
          <span style={{ fontSize: 13 }}>{`(${product.rating ?? 0})`}</span>
        </div>
        <div className="mb-2">
          {price !== null ? (
            <span className="fw-bold fs-5">{price.toFixed(2)} ₺</span>
          ) : (
            <span className="text-muted">No price information</span>
          )}
          {hasValidDiscount && (
            <span className="text-muted ms-2 text-decoration-line-through">{discount.toFixed(2)}₺</span>
          )}
        </div>
        <CButton
          color={stock === 0 ? 'secondary' : 'success'}
          className="w-100"
          onClick={handleAddToCart}
          disabled={isAddingToCart || stock === 0 || cartQuantity >= stock}
        >
          <FiShoppingCart size={16} className="me-2" />
          {isAddingToCart ? <CSpinner size="sm" /> : (stock === 0 ? 'Out of Stock' : 'Add to Cart')}
        </CButton>
      </CCardBody>
    </CCard>
  );
};

export default ProductCard;
