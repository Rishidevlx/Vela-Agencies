import React, { useState } from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

import confetti from 'canvas-confetti';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState('');

  const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleAddToCart = () => {
    // Trigger global fireworks animation
    window.dispatchEvent(new Event('trigger-fireworks'));

    addToCart(product, quantity === '' ? (product.moq || 1) : parseInt(quantity));
    setQuantity('');
  };

  return (
    <div className={`group flex bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden font-body relative border border-gray-100 ${
      viewMode === 'list' ? 'flex-row' : 'flex-col'
    }`}>
      
      {/* Discount Badge */}
      {product.discount && (
        <div className="absolute top-3 left-3 bg-[#F8B400] text-white text-xs font-bold px-2 py-1 rounded-full z-20 shadow-sm">
          -{product.discount}%
        </div>
      )}

      {/* Wishlist Heart Icon */}
      <button 
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 z-20 text-gray-400 hover:text-brand hover:scale-110 transition-all duration-300 bg-white p-2 rounded-full shadow-sm hover:shadow-md"
      >
        {isWishlisted ? (
          <FaHeart className="text-lg text-brand" />
        ) : (
          <FiHeart className="text-lg" />
        )}
      </button>

      {/* Product Image Link */}
      <Link 
        to={`/product/${slugify(product.name)}`} 
        className={`relative bg-gray-50 flex items-center justify-center p-4 overflow-hidden block ${
          viewMode === 'list' ? 'w-1/3 min-w-[150px] sm:min-w-[200px] border-r border-gray-100' : 'w-full h-48 sm:h-56'
        }`}
      >
        <img 
          src={product.image || 'https://via.placeholder.com/200'} 
          alt={`${product.name} - Sivakasi Crackers Wholesale | Vela Agencies`} 
          loading="lazy"
          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-in-out drop-shadow-md"
        />
        
        {/* Overlay Action (optional, keeping it simple for now) */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>

      {/* Product Details */}
      <div className={`p-5 flex flex-col flex-1 ${viewMode === 'list' ? 'justify-center text-left' : 'text-center'}`}>
        <Link to={`/product/${slugify(product.name)}`}>
          <h3 className={`font-bold text-gray-800 hover:text-brand transition-colors line-clamp-2 ${viewMode === 'list' ? 'text-lg md:text-xl mb-2' : 'text-base mb-1 line-clamp-1'}`}>
            {product.name}
          </h3>
        </Link>
        
        {product.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Pricing & Total */}
        <div className={`mt-auto flex flex-col mb-4 ${viewMode === 'list' ? 'items-start mt-4' : 'items-center'}`}>
          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            )}
            <span className="text-lg font-bold text-[#F8B400]">
              ₹{product.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} {product.unit && <span className="text-sm text-gray-500 font-medium ml-1 capitalize">/ Per {product.unit}</span>}
            </span>
          </div>
          {/* Fixed height container to prevent layout shift */}
          <div className="h-4 mt-0.5 flex items-center">
            {quantity !== '' && parseInt(quantity) > 0 && (
              <span className="text-xs font-bold text-green-600">
                Total: ₹{(product.price * parseInt(quantity)).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            )}
          </div>
        </div>

        {/* QTY & Add to Cart */}
        <div className={`flex items-center gap-2 ${viewMode === 'list' ? 'w-full max-w-[300px]' : 'w-full'}`}>
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-full bg-gray-50 overflow-hidden h-10 flex-1 shadow-inner">
            <button 
              onClick={() => setQuantity(prev => prev === '' ? (product.moq || 1) : Math.max((product.moq || 1), prev - 1))}
              className="px-2 h-full text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none text-lg font-medium"
            >
              -
            </button>
            <input 
              type="number" 
              value={quantity}
              placeholder="QTY"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 0) setQuantity(val);
                else if (e.target.value === '') setQuantity('');
              }}
              onBlur={() => {
                if (quantity !== '' && quantity < (product.moq || 1)) setQuantity(product.moq || 1);
              }}
              className="w-full text-center text-sm font-bold text-gray-800 bg-transparent outline-none p-0 appearance-none m-0 placeholder-gray-400"
              style={{ WebkitAppearance: 'none', margin: 0 }}
            />
            <button 
              onClick={() => setQuantity(prev => (prev === '' ? (product.moq || 1) + 1 : prev + 1))}
              className="px-2 h-full text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none flex-1 text-lg font-medium"
            >
              +
            </button>
          </div>

          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-[#C70E17] text-white h-10 rounded-full flex items-center justify-center gap-1.5 font-bold text-xs hover:bg-[#F8B400] hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
          >
            <FiShoppingCart className="text-sm" />
            <span>ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
