import React from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart } from 'react-icons/fi';

const FloatingCart = () => {
  const location = useLocation();
  const { cartItems, setIsCartOpen, isCartOpen } = useCart();

  if (location.pathname !== '/shop' || isCartOpen) return null;

  const uniqueProductCount = cartItems.length;

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-[105px] right-6 bg-brand border-2 border-white text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
    >
      <FiShoppingCart className="text-2xl" />
      
      {uniqueProductCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[11px] font-extrabold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          {uniqueProductCount}
        </span>
      )}
      
      <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        View Cart
      </span>
    </button>
  );
};

export default FloatingCart;
