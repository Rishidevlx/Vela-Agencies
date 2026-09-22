import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const FloatingWhatsApp = () => {
  const [whatsappInfo, setWhatsappInfo] = useState({ number: '', message: '' });
  const { isCartOpen } = useCart();

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.whatsapp_settings) {
          setWhatsappInfo({
            number: data.data.whatsapp_settings.number || '',
            message: data.data.whatsapp_settings.defaultMessage || ''
          });
        }
      })
      .catch(err => console.error('Error fetching whatsapp settings:', err));
  }, []);

  const encodedMessage = encodeURIComponent(whatsappInfo.message);
  const waLink = whatsappInfo.number 
    ? `https://wa.me/${whatsappInfo.number}?text=${encodedMessage}` 
    : '#';

  if (!whatsappInfo.number || isCartOpen) return null; // Don't show if no number configured or cart is open

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
    >
      <FaWhatsapp className="text-3xl" />
      
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        Chat with us!
      </span>
    </a>
  );
};

export default FloatingWhatsApp;
