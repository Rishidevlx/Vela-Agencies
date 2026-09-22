import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPhoneAlt } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const FloatingCall = () => {
  const [callNumber, setCallNumber] = useState('');
  const { isCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.contact_details && data.data.contact_details.call_number) {
          setCallNumber(data.data.contact_details.call_number);
        }
      })
      .catch(err => console.error('Error fetching contact details:', err));
  }, []);

  if (!callNumber || isCartOpen || location.pathname === '/shop') return null; 

  return (
    <a
      href={`tel:${callNumber}`}
      className="fixed bottom-[105px] right-6 bg-[#007bff] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
    >
      <FaPhoneAlt className="text-2xl" />
      
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        Call us now!
      </span>
    </a>
  );
};

export default FloatingCall;
