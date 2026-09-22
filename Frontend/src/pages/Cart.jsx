import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [waSettings, setWaSettings] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.whatsapp_settings) {
          setWaSettings(data.data.whatsapp_settings);
        }
      })
      .catch(err => console.error('Error fetching WA settings:', err));
  }, []);

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

      // Check the latest toggle state
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

  return (
    <div className="bg-gray-50 min-h-screen py-12 font-body">
      <div className="max-w-6xl mx-auto px-5 md:px-12">
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <FiShoppingBag className="text-4xl text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any crackers to your cart yet.</p>
            <Link 
              to="/shop" 
              className="bg-brand text-white font-bold py-3 px-8 rounded-full hover:bg-[#3e1e5c] transition-colors flex items-center gap-2 shadow-md"
            >
              <FiArrowLeft /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="lg:w-2/3 flex flex-col gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-50 rounded-lg p-2 border border-gray-100 flex-shrink-0">
                    <img 
                      src={item.image || 'https://via.placeholder.com/150'} 
                      alt={item.name} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 text-center sm:text-left w-full">
                    <Link to={`/product/${item.id}`} className="text-lg font-bold text-gray-800 hover:text-brand transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <span className="font-bold text-brand text-lg">₹{item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      {item.unit && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">per {item.unit}</span>}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-gray-300 rounded-md h-10 w-28">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-brand hover:bg-gray-50 transition-colors"
                      >
                        <FiMinus />
                      </button>
                      <span className="flex-1 h-full flex items-center justify-center font-semibold text-gray-800 border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-brand hover:bg-gray-50 transition-colors"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove Item"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
                
                <div className="flex flex-col gap-4 text-gray-600 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{cartTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-sm text-brand font-medium">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="font-bold text-gray-800 text-lg">Total</span>
                  <span className="font-bold text-brand text-2xl">₹{cartTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>

                <button className="w-full bg-brand hover:bg-[#F8B400] text-white hover:text-white font-bold py-4 rounded-lg transition-colors shadow-md flex justify-center items-center gap-2 mb-3">
                  <FiShoppingBag /> Proceed to Checkout
                </button>
                
                <button 
                  onClick={handleEnquiryClick}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-lg transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
                  WhatsApp Enquiry
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  Taxes and shipping calculated at checkout.
                </p>
              </div>
            </div>
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
    </div>
  );
};

export default Cart;
