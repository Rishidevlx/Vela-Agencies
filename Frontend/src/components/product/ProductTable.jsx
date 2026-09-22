import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { FiMinus, FiPlus, FiX } from 'react-icons/fi';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

const ProductTable = ({ products }) => {
  const { addToCart } = useCart();
  
  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  // Local state for tracking quantities before adding to cart
  const [quantities, setQuantities] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  const handleQtyChange = (productId, delta, moq = 1) => {
    setQuantities(prev => {
      const current = prev[productId] !== undefined && prev[productId] !== '' ? prev[productId] : (moq - 1);
      const newQty = current + delta;
      return {
        ...prev,
        [productId]: newQty < moq ? moq : newQty
      };
    });
  };

  const handleQtyInput = (productId, value, moq = 1) => {
    if (value === '') {
      setQuantities(prev => ({ ...prev, [productId]: '' }));
      return;
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      setQuantities(prev => ({
        ...prev,
        [productId]: parsed < moq ? moq : parsed
      }));
    }
  };

  const handleOrderNow = (product) => {
    const qty = quantities[product.id];
    
    // Validation
    if (qty === undefined || qty === '' || isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity before ordering.", { style: { background: '#333', color: '#fff' }});
      return;
    }

    const finalQty = parseInt(qty, 10);
    
    // Trigger global fireworks animation
    window.dispatchEvent(new Event('trigger-fireworks'));

    addToCart(product, finalQty);
  };

  return (
    <>
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
            <FiX size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Product Popup" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl bg-white p-2"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-body mb-8">
        <div className="w-full">
            
          {/* Table Header (First Row Yellow) */}
          <div className="flex bg-[#F8B400] text-gray-950 font-black uppercase text-[10px] md:text-sm py-3 px-2 md:px-4 shadow-sm border-b border-amber-300">
            <div className="w-12 md:w-[100px] text-center shrink-0">IMG</div>
            <div className="flex-1 px-1 md:px-4 text-left">PRODUCT</div>
            <div className="w-12 md:w-[120px] text-center shrink-0">PRICE</div>
            <div className="w-24 md:w-[160px] text-center shrink-0">QTY</div>
            <div className="w-16 md:w-[200px] text-center md:pl-4 shrink-0">AMOUNT</div>
          </div>

          {/* Grouped Rows */}
          {Object.entries(groupedProducts).map(([category, items]) => (
            <div key={category} className="mb-0">
              {/* Category Header */}
              <div className="bg-brand text-white font-bold text-center py-2 text-xs md:text-sm uppercase shadow-sm border-b border-brand">
                {category}
              </div>
              
              <div className="flex flex-col divide-y divide-gray-200 bg-white">
                {items.map(product => {
                  const qty = quantities[product.id] !== undefined ? quantities[product.id] : '';
                  const calcQty = qty === '' ? 0 : parseInt(qty, 10);
                  const amount = product.price * calcQty;

                  return (
                    <div key={product.id} className="flex items-center py-3 md:py-4 px-2 md:px-4 hover:bg-gray-50 transition-colors">
                      
                      {/* Image */}
                      <div className="w-12 md:w-[100px] flex justify-center shrink-0 cursor-pointer" onClick={() => setSelectedImage(product.image)}>
                        <img 
                          src={product.image || 'https://via.placeholder.com/50'} 
                          alt={product.name} 
                          className="w-10 h-10 md:w-16 md:h-16 object-contain bg-white rounded shadow-sm border border-gray-100 mix-blend-multiply hover:scale-105 transition-transform"
                        />
                      </div>
                      
                      {/* Name */}
                      <div className="flex-1 px-1 md:px-4 text-left">
                        <h3 className="font-bold text-gray-800 text-[10px] md:text-base line-clamp-2 md:line-clamp-none leading-tight">{product.name}</h3>
                      </div>

                      {/* Price */}
                      <div className="w-12 md:w-[120px] text-center flex flex-col items-center justify-center shrink-0">
                        {product.originalPrice && (
                          <span className="text-gray-400 line-through text-[9px] md:text-xs">₹{product.originalPrice}</span>
                        )}
                        <span className="font-bold text-[#00A15D] text-[11px] md:text-lg leading-tight">₹{product.price}</span>
                        {product.unit && <span className="text-[8px] md:text-[11px] text-gray-500 font-medium capitalize mt-0.5">/ Per {product.unit}</span>}
                      </div>

                      {/* Qty Selector */}
                      <div className="w-24 md:w-[160px] flex justify-center shrink-0 px-1">
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden h-8 md:h-10 w-full md:w-32 bg-white shadow-sm">
                          <button 
                            onClick={() => handleQtyChange(product.id, -1, product.moq)}
                            className="w-6 md:w-10 h-full flex justify-center items-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors bg-gray-50"
                          >
                            <FiMinus size={12} className="md:w-4 md:h-4" />
                          </button>
                          <input 
                            type="text" 
                            value={qty}
                            onChange={(e) => handleQtyInput(product.id, e.target.value, product.moq)}
                            placeholder="QTY"
                            className="flex-1 w-full h-full text-center text-[10px] md:text-sm font-bold border-x border-gray-300 outline-none focus:ring-1 focus:ring-brand/30"
                          />
                          <button 
                            onClick={() => handleQtyChange(product.id, 1, product.moq)}
                            className="w-6 md:w-10 h-full flex justify-center items-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors bg-gray-50"
                          >
                            <FiPlus size={12} className="md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Amount & Button */}
                      <div className="w-16 md:w-[200px] flex flex-col md:flex-row items-center justify-center md:justify-between md:pl-4 shrink-0 gap-1 md:gap-0">
                        <span className="font-bold text-gray-800 text-[10px] md:text-lg whitespace-nowrap text-center">
                          ₹{amount}
                        </span>
                        <button 
                          onClick={() => handleOrderNow(product)}
                          className="bg-[#C70E17] text-white hover:bg-[#F8B400] hover:text-white text-[9px] md:text-xs font-bold py-1.5 md:py-2 px-2 md:px-4 rounded-md transition-all shadow-md uppercase tracking-wider whitespace-nowrap cursor-pointer"
                        >
                          <span className="md:hidden">Add</span>
                          <span className="hidden md:inline">Order Now</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {products.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-semibold bg-gray-50">
              No products available.
            </div>
          )}
          
        </div>
      </div>
    </>
  );
};

export default ProductTable;
