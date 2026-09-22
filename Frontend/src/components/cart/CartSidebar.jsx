import React, { useState } from 'react';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiX, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, sidebarTab, setSidebarTab, addToCart, clearCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [waSettings, setWaSettings] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateWhatsAppUrl = (waNumber, enquiryNo, invoiceUrl) => {
    let message = "Hi, I would like to place an order:\n\n";
    if (enquiryNo) {
      message += `*Enquiry No:* #${enquiryNo}\n\n`;
    }
    
    // Brief cart summary
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} - ${item.quantity} ${item.unit || ''}\n`;
    });
    
    message += `\n*Total Amount: ₹${cartTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}*\n\n`;
    
    if (invoiceUrl) {
      message += `📄 *View Detailed Invoice:*\n${invoiceUrl}\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${waNumber}?text=${encodedMessage}`;
  };

  const handleEnquiryClick = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const data = await res.json();
      const currentWaSettings = data.data?.whatsapp_settings;
      
      if (!currentWaSettings?.number) {
        toast.error('WhatsApp number not configured. Please try again later.');
        return;
      }
      
      setWaSettings(currentWaSettings);

      if (currentWaSettings.collect_mobile_number) {
        setIsModalOpen(true);
      } else {
        window.open(generateWhatsAppUrl(currentWaSettings.number), '_blank');
      }
    } catch (error) {
      console.error('Error fetching latest settings:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/enquiries/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          customer_name: customerName,
          address: address,
          city: city,
          pincode: pincode,
          cart_data: cartItems
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        setMobileNumber('');
        setCustomerName('');
        setAddress('');
        setCity('');
        setPincode('');
        
        window.open(generateWhatsAppUrl(waSettings.number, data.enquiry_no, data.invoice_url), '_blank');
        clearCart();
      } else {
        toast.error('Failed to submit enquiry. Please try again.');
      }
    } catch (error) {
      console.error('Enquiry error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveToCart = (product) => {
    addToCart(product, product.moq || 1);
    removeFromWishlist(product.id);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-primary z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col font-body ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with Tabs */}
        <div className="bg-brand text-white pt-5 px-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading tracking-wider uppercase">YOUR SELECTIONS</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none"
            >
              &times;
            </button>
          </div>
          <div className="flex w-full border-b border-white/20">
            <button 
              onClick={() => setSidebarTab('cart')}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${sidebarTab === 'cart' ? 'border-b-4 border-footer text-white' : 'text-white/60 hover:text-white'}`}
            >
              Cart ({cartItems.length})
            </button>
            <button 
              onClick={() => setSidebarTab('wishlist')}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${sidebarTab === 'wishlist' ? 'border-b-4 border-footer text-white' : 'text-white/60 hover:text-white'}`}
            >
              Wishlist ({wishlistItems.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          
          {sidebarTab === 'cart' && (
            <div className={`h-full ${cartItems.length === 0 ? 'flex flex-col items-center justify-center text-center' : ''}`}>
              {cartItems.length === 0 ? (
                <>
                  <div className="w-24 h-24 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiShoppingCart className="text-4xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Your cart is currently empty.</p>
                  <button 
                    onClick={onClose}
                    className="mt-6 bg-[#F8B400] text-black px-6 py-2 rounded-full hover:bg-[#E53935] hover:text-white transition-colors text-sm font-bold tracking-wide"
                  >
                    CONTINUE SHOPPING
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4 relative">
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 border border-gray-100 flex-shrink-0">
                        <img 
                          src={item.image || 'https://via.placeholder.com/150'} 
                          alt={item.name} 
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 line-clamp-1 pr-6">{item.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="font-bold text-brand text-sm">₹{item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            {item.unit && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">per {item.unit}</span>}
                          </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-300 rounded-md h-7 w-20">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-full flex items-center justify-center text-gray-600 hover:text-brand hover:bg-gray-50 transition-colors text-xs"
                            >
                              <FiMinus />
                            </button>
                            <span className="flex-1 h-full flex items-center justify-center font-semibold text-gray-800 border-x border-gray-300 text-xs">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-full flex items-center justify-center text-gray-600 hover:text-brand hover:bg-gray-50 transition-colors text-xs"
                            >
                              <FiPlus />
                            </button>
                          </div>

                          <div className="font-bold text-gray-800 text-sm">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {sidebarTab === 'wishlist' && (
            <div className={`h-full ${wishlistItems.length === 0 ? 'flex flex-col items-center justify-center text-center' : ''}`}>
              {wishlistItems.length === 0 ? (
                <>
                  <div className="w-24 h-24 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiHeart className="text-4xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Your wishlist is currently empty.</p>
                  <button 
                    onClick={() => { setSidebarTab('cart'); onClose(); }}
                    className="mt-6 bg-[#F8B400] text-black px-6 py-2 rounded-full hover:bg-[#E53935] hover:text-white transition-colors text-sm font-bold tracking-wide"
                  >
                    DISCOVER PRODUCTS
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4 relative">
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 border border-gray-100 flex-shrink-0 cursor-pointer" onClick={onClose}>
                        <Link to={`/product/${item.id}`}>
                          <img 
                            src={item.image || item.main_image || 'https://via.placeholder.com/150'} 
                            alt={item.name} 
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </Link>
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link to={`/product/${item.id}`} onClick={onClose}>
                            <h3 className="text-sm font-bold text-gray-800 line-clamp-1 pr-6 hover:text-brand transition-colors">{item.name}</h3>
                          </Link>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="font-bold text-brand text-sm">₹{Number(item.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            {item.unit && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">per {item.unit}</span>}
                          </div>
                        </div>

                        {/* Move to Cart */}
                        <div className="mt-2">
                          <button 
                            onClick={() => moveToCart(item)}
                            className="bg-[#F8B400] text-black hover:bg-[#E53935] hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm uppercase w-fit"
                          >
                            Move to Cart
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Area (Only for Cart) */}
        {sidebarTab === 'cart' && cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4 font-bold text-lg text-gray-800">
              <span>Subtotal:</span>
              <span className="text-brand">₹{cartTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">Taxes and shipping calculated at checkout</p>
            <button 
              onClick={handleEnquiryClick}
              className="w-full bg-[#25D366] text-white py-3 rounded-full font-bold hover:bg-[#128C7E] transition-colors shadow-md flex items-center justify-center gap-2 tracking-wide"
            >
              <FaWhatsapp className="text-xl" />
              WHATSAPP ENQUIRY
            </button>
          </div>
        )}
      </div>

      {/* Modal for Mobile Number Collection (Compact, Sleek & Fully Responsive) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-3 sm:p-4 font-body backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden relative animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100/80 text-emerald-600 rounded-full flex items-center justify-center text-xl shrink-0 shadow-xs">
                  <FiMessageCircle />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-heading text-gray-900 leading-tight">
                    WhatsApp Checkout
                  </h2>
                  <p className="text-xs text-gray-500">
                    Enter details to generate your invoice & complete order on WhatsApp
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 p-1.5 rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Modal Body & Form */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleMobileSubmit} className="flex flex-col gap-3.5">
                
                {/* Row 1: Name & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter Customer Name" 
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm font-medium text-gray-800 shadow-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                    <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 shadow-xs">
                      <div className="flex items-center justify-center px-2.5 bg-gray-100 border-r border-gray-200 text-gray-600 font-bold text-xs select-none">
                        +91
                      </div>
                      <input 
                        type="text" 
                        value={mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setMobileNumber(val);
                        }}
                        placeholder="Enter 10-digit mobile number" 
                        className="flex-1 w-full px-2.5 py-2 bg-transparent outline-none text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address <span className="text-red-500">*</span></label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete delivery address (Street, Door No, Landmark, Area)..." 
                    rows="2"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm font-medium text-gray-800 shadow-xs resize-none"
                    required
                  ></textarea>
                </div>

                {/* Row 3: City & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City / Town <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter City / Town / State" 
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm font-medium text-gray-800 shadow-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit Pincode" 
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm font-medium text-gray-800 shadow-xs"
                      required
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-[#25D366] hover:bg-[#1ebd5d] text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FaWhatsapp className="text-lg" />
                  <span>{isSubmitting ? 'Generating Invoice...' : 'Proceed to WhatsApp'}</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CartSidebar;
