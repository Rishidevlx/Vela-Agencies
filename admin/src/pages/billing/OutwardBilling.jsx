import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Helper for Indian Currency in Words (Simcha Style)
const numberToWordsINR = (num) => {
  if (!num || isNaN(num) || Number(num) === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + Math.floor(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (n[1] !== '00') ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] !== '00') ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] !== '00') ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] !== '0') ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return (str.trim() + ' Rupees Only').replace(/\s+/g, ' ');
};

// Searchable Product Autocomplete Component for Row (Simcha Style)
const ProductSearchInput = ({ 
  value, 
  onSelect, 
  allProducts, 
  placeholder = "Search & select product / item...",
  onFocusQty
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 12);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product) => {
    setQuery(product.name);
    setIsOpen(false);
    onSelect(product);
    if (onFocusQty) onFocusQty();
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 pr-8 text-sm font-medium text-gray-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition-colors shadow-sm"
        />
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          tabIndex={-1}
          className="absolute right-2.5 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[320px] sm:min-w-[400px] bg-white border border-gray-200 rounded-lg shadow-2xl max-h-72 overflow-y-auto z-[99999]">
          <div className="p-1.5 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
            <span>Product Name</span>
            <span>Price / Unit</span>
          </div>
          {filtered.map((product, idx) => (
            <div
              key={product.id}
              onClick={() => handleSelect(product)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-50 last:border-0 ${
                idx === highlightedIndex ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col pr-2">
                <span className="text-sm font-bold text-gray-900">{product.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.category_name && (
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {product.category_name}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400">
                    Stock Available • {product.unit || 'packet'}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-extrabold text-sm text-blue-900">₹{Number(product.price).toFixed(2)}</span>
                <span className="text-[10px] text-gray-400 block capitalize">/ {product.unit || 'pkt'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OutwardBilling = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Form State (Required Fields)
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Edit bill meta
  const [existingBillNo, setExistingBillNo] = useState(null);

  // Products Database
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Billing Line Items
  const [items, setItems] = useState([
    { id: 1, productId: '', name: '', price: 0, originalPrice: 0, unit: 'packet', quantity: 1, image: null, total: 0 }
  ]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus refs for quantity
  const qtyRefs = useRef({});

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/products?admin=true', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAllProducts(data.data.filter(p => p.status === 'active'));
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        toast.error('Failed to fetch product list');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch existing bill if editId is provided
  useEffect(() => {
    if (!editId) return;

    const fetchEditBill = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/${editId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const b = data.data;
          setExistingBillNo(b.bill_no);
          setBillDate(b.bill_date ? b.bill_date.split('T')[0] : new Date().toISOString().split('T')[0]);
          setCustomerName(b.customer_name || '');
          setPhoneNumber(b.phone_number || '');
          setAddress(b.address || '');
          setCity(b.city || '');
          setPincode(b.pincode || '');
          setDiscount(parseFloat(b.discount) || 0);

          let parsedItems = [];
          if (typeof b.items === 'string') {
            try { parsedItems = JSON.parse(b.items); } catch(e) {}
          } else if (Array.isArray(b.items)) {
            parsedItems = b.items;
          }

          if (parsedItems.length > 0) {
            setItems(parsedItems.map((it, idx) => ({
              id: Date.now() + idx,
              productId: it.id || it.product_id || it.productId || 'edit-' + idx,
              name: it.name || '',
              price: parseFloat(it.price) || 0,
              originalPrice: parseFloat(it.originalPrice || it.price) || 0,
              unit: it.unit || 'packet',
              quantity: parseInt(it.quantity) || 1,
              image: it.image || null,
              total: (parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1)
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch bill for editing:', err);
        toast.error('Could not load bill details for editing');
      }
    };

    fetchEditBill();
  }, [editId]);

  // Keyboard Shortcuts (Ctrl + Enter: Save & Go to List, Alt + A: Add Row, Alt + C: Reset)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'Enter') || e.key === 'F2' || (e.ctrlKey && (e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        handleSubmitBill();
      }
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        addItemRow();
      }
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        handleResetForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, billDate, customerName, phoneNumber, address, city, pincode, discount, editId]);

  // Add a new empty row
  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now(), productId: '', name: '', price: 0, originalPrice: 0, unit: 'packet', quantity: 1, image: null, total: 0 }
    ]);
  };

  // Remove row
  const removeItemRow = (index) => {
    if (items.length === 1) {
      setItems([{ id: Date.now(), productId: '', name: '', price: 0, originalPrice: 0, unit: 'packet', quantity: 1, image: null, total: 0 }]);
      return;
    }
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Select Product Handler
  const handleProductSelect = (index, product) => {
    let parsedUnit = 'packet';
    if (product.unit) {
      try {
        const u = typeof product.unit === 'string' ? JSON.parse(product.unit) : product.unit;
        if (Array.isArray(u) && u.length > 0) parsedUnit = u[0];
        else if (typeof u === 'string') parsedUnit = u;
      } catch (e) {
        parsedUnit = product.unit;
      }
    }

    const price = parseFloat(product.price) || 0;
    const origPrice = parseFloat(product.original_price) || price;
    const moq = parseInt(product.moq) || 1;

    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: product.id,
        name: product.name,
        price,
        originalPrice: origPrice,
        unit: parsedUnit,
        quantity: copy[index].quantity > 0 ? copy[index].quantity : moq,
        image: product.main_image || null,
        total: price * (copy[index].quantity > 0 ? copy[index].quantity : moq)
      };
      return copy;
    });

    setTimeout(() => {
      if (qtyRefs.current[index]) {
        qtyRefs.current[index].focus();
        qtyRefs.current[index].select();
      }
    }, 50);
  };

  // Quantity Change handler
  const handleQuantityChange = (index, value) => {
    const qty = value === '' ? '' : Math.max(1, parseInt(value) || 1);
    setItems(prev => {
      const copy = [...prev];
      const linePrice = copy[index].price || 0;
      copy[index] = {
        ...copy[index],
        quantity: qty,
        total: linePrice * (qty === '' ? 0 : qty)
      };
      return copy;
    });
  };

  // Price Change handler
  const handlePriceChange = (index, value) => {
    const price = value === '' ? '' : parseFloat(value) || 0;
    setItems(prev => {
      const copy = [...prev];
      const qty = typeof copy[index].quantity === 'number' ? copy[index].quantity : 1;
      copy[index] = {
        ...copy[index],
        price,
        total: (price === '' ? 0 : price) * qty
      };
      return copy;
    });
  };

  // Calculations
  const validItems = items.filter(it => it.productId && it.quantity > 0);
  const subtotal = validItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  const totalItemsCount = validItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  const parsedDiscount = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - parsedDiscount);

  // Reset Form
  const handleResetForm = () => {
    setCustomerName('');
    setPhoneNumber('');
    setAddress('');
    setCity('');
    setPincode('');
    setDiscount(0);
    setItems([{ id: Date.now(), productId: '', name: '', price: 0, originalPrice: 0, unit: 'packet', quantity: 1, image: null, total: 0 }]);
    toast.success('Form cleared');
  };

  // Save / Update Bill with Required Customer Details Validation
  const handleSubmitBill = async () => {
    // 1. Validate Customer Details (Required)
    if (!customerName.trim()) {
      toast.error('Please enter Customer / Client Name.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter Billing / Delivery Address.');
      return;
    }

    if (!city.trim()) {
      toast.error('Please enter City / Town.');
      return;
    }

    const cleanPin = pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length < 6) {
      toast.error('Please enter a valid 6-digit Pincode.');
      return;
    }

    // 2. Validate Products
    if (validItems.length === 0) {
      toast.error('Please select at least one product item.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      bill_date: billDate,
      customer_name: customerName.trim(),
      phone_number: cleanPhone,
      address: address.trim(),
      city: city.trim(),
      pincode: cleanPin,
      items: validItems,
      discount: parsedDiscount,
      payment_mode: 'Cash'
    };

    try {
      const token = localStorage.getItem('adminToken');
      const url = editId 
        ? `${import.meta.env.VITE_API_URL}/api/billing/${editId}` 
        : `${import.meta.env.VITE_API_URL}/api/billing`;
      
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        const billNumber = data.data?.bill_no || existingBillNo || '';
        toast.success(editId ? `Bill #${billNumber} Updated Successfully!` : `Bill #${billNumber} Generated Successfully!`);
        navigate('/dashboard/billing/list');
      } else {
        toast.error(data.message || 'Failed to process bill');
      }
    } catch (err) {
      console.error('Error submitting bill:', err);
      toast.error('Error generating bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 sm:p-5 lg:p-8 bg-[#f8fafc] min-h-screen font-body text-slate-800 pb-24 lg:pb-8 w-full max-w-7xl mx-auto overflow-x-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              {editId ? `Edit Invoice #${existingBillNo || ''}` : 'Create New Invoice (Outward)'}
            </h1>
            {editId && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded font-bold uppercase">
                Editing Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill required customer details and select products to generate official outward invoice.
          </p>
        </div>

        {/* Shortcuts Tag & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-600 font-mono">
            <span><strong className="text-slate-800">Ctrl+Enter</strong> Save</span>
            <span>|</span>
            <span><strong className="text-slate-800">Alt+A</strong> Add Item</span>
            <span>|</span>
            <span><strong className="text-slate-800">Alt+C</strong> Reset</span>
          </div>

          <button
            type="button"
            onClick={handleResetForm}
            className="flex-1 sm:flex-none text-center px-3 sm:px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
          >
            Reset Form
          </button>

          <Link
            to="/dashboard/billing/list"
            className="flex-1 sm:flex-none text-center px-3 sm:px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
          >
            View Outward List
          </Link>

          <button
            type="button"
            onClick={handleSubmitBill}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving Bill...' : (editId ? 'Update & Save (Ctrl+Enter)' : 'Save Invoice (Ctrl+Enter)')}
          </button>
        </div>
      </div>

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left 8 Cols: Customer Details & Items Table */}
        <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6">
          
          {/* Customer Details Card (All Fields Required) */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3.5 sm:p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 sm:mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-700 rounded-full"></span>
                BILL TO / CUSTOMER DETAILS
              </span>
              <span className="text-[10px] text-red-500 font-semibold lowercase tracking-normal">
                * all fields are mandatory
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {/* Bill Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded py-2 px-3 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
                  required
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Client Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded py-2 px-3 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone (10-Digits) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-white border border-slate-300 rounded py-2 px-3 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
                  required
                />
              </div>

              {/* Address (Textarea) */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing / Delivery Address <span className="text-red-500">*</span></label>
                <textarea
                  rows="2"
                  placeholder="Enter complete delivery address (Street, Door No, Landmark, Area)..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded py-2 px-3 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm resize-y"
                  required
                />
              </div>

              {/* City */}
              <div className="sm:col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town / State <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter City / Town / State"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded py-2 px-3 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
                  required
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode (6-Digits) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-white border border-slate-300 rounded py-2 px-3 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product Items Table Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-700 rounded-full"></span>
                INVOICE LINE ITEMS ({items.length})
              </h2>

              <button
                type="button"
                onClick={addItemRow}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded transition-colors cursor-pointer shadow-sm flex items-center gap-1"
              >
                + Add Line Item (Alt+A)
              </button>
            </div>

            {/* Clean Horizontal-Scrollable Table Container */}
            <div className="overflow-x-auto w-full p-2 sm:p-4 scrollbar-thin">
              <table className="w-full text-left text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                    <th className="py-2.5 px-2 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[260px]">Item Name *</th>
                    <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-24 text-center">Quantity</th>
                    <th className="py-2.5 px-2 w-16 text-center">Unit</th>
                    <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      {/* Index */}
                      <td className="py-3 px-2 text-center text-slate-500 font-bold text-xs">
                        {index + 1}
                      </td>

                      {/* Search Product */}
                      <td className="py-2.5 px-3">
                        <ProductSearchInput
                          value={item.name}
                          allProducts={allProducts}
                          onSelect={(product) => handleProductSelect(index, product)}
                          onFocusQty={() => {
                            if (qtyRefs.current[index]) {
                              qtyRefs.current[index].focus();
                            }
                          }}
                        />
                      </td>

                      {/* Price (Editable) */}
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          className="w-24 sm:w-28 bg-white border border-slate-300 rounded py-2 px-2 text-xs sm:text-sm font-bold text-right text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          ref={(el) => (qtyRefs.current[index] = el)}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (index === items.length - 1) {
                                addItemRow();
                              }
                            }
                          }}
                          className="w-18 sm:w-20 bg-white border border-slate-300 rounded py-2 px-2 text-xs sm:text-sm font-bold text-center text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
                        />
                      </td>

                      {/* Unit */}
                      <td className="py-2.5 px-2 text-center text-slate-600 text-[11px] font-semibold uppercase">
                        {item.unit || 'pkt'}
                      </td>

                      {/* Line Total Badge */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="bg-emerald-50 border border-emerald-200/80 rounded py-1.5 px-2 font-bold text-emerald-900 text-xs sm:text-sm whitespace-nowrap">
                          ₹{(parseFloat(item.total) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Remove Button */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="text-slate-400 hover:text-red-600 p-1.5 font-bold hover:bg-red-50 rounded text-xs transition-colors cursor-pointer"
                          title="Remove row"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom row actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 px-3 py-1.5 hover:bg-blue-50 rounded transition-colors cursor-pointer"
              >
                + Add Another Line Item
              </button>

              <div className="text-xs font-semibold text-slate-600">
                Total Line Items: <span className="font-bold text-slate-900">{totalItemsCount}</span> units
              </div>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: INVOICE SUMMARY */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-5 sticky top-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 sm:mb-4 border-b border-slate-200 pb-2.5 flex items-center justify-between">
              <span>INVOICE SUMMARY</span>
              {existingBillNo && (
                <span className="font-mono text-blue-700">INV/#{existingBillNo}</span>
              )}
            </h2>

            <div className="space-y-3.5 sm:space-y-4 text-sm">
              
              {/* Itemized List in Summary */}
              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/70 max-h-48 sm:max-h-56 overflow-y-auto space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Selected Items ({validItems.length})
                </span>
                
                {validItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">
                    No items selected yet. Choose products from the left table.
                  </p>
                ) : (
                  validItems.map((item, i) => (
                    <div key={item.id || i} className="flex justify-between items-start text-xs border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                      <div className="flex flex-col pr-2">
                        <span className="font-bold text-slate-800 line-clamp-1">{item.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {item.quantity} {item.unit || 'pkt'} × ₹{Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{(parseFloat(item.total) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-slate-700 pt-1">
                <span className="font-medium text-xs sm:text-sm">Subtotal ({totalItemsCount} items)</span>
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount */}
              <div className="flex justify-between items-center gap-2 pt-2.5 border-t border-slate-200">
                <span className="font-medium text-xs sm:text-sm text-slate-700">Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-28 sm:w-32 bg-white border border-slate-300 rounded py-1.5 sm:py-2 px-3 text-right font-bold text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
                />
              </div>

              {/* Grand Total Box */}
              <div className="bg-blue-800 text-white rounded-lg p-3.5 sm:p-4 shadow-md">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-90 block">
                  Grand Total
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-heading mt-0.5">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Amount In Words */}
              <div className="bg-blue-50/60 border border-blue-100 rounded p-2.5 sm:p-3 text-xs">
                <span className="font-bold text-blue-950 block text-[10px] uppercase tracking-wider">Amount in Words</span>
                <p className="text-blue-900 font-semibold mt-0.5 capitalize italic text-[11px] leading-snug">
                  {numberToWordsINR(grandTotal)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSubmitBill}
                  disabled={isSubmitting}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded shadow transition-colors text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving Invoice...' : (editId ? 'Update Invoice (Ctrl+Enter)' : 'Save Invoice (Ctrl+Enter)')}
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded text-xs transition-colors cursor-pointer"
                >
                  Reset Form (Alt+C)
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Mobile Floating Sticky Footer Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] z-30 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block leading-tight">Total</span>
          <span className="text-base font-black text-blue-900 font-heading">
            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSubmitBill}
          disabled={isSubmitting}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
        >
          {isSubmitting ? 'Saving...' : (editId ? 'Update Bill' : 'Save Invoice')}
        </button>
      </div>

    </div>
  );
};

export default OutwardBilling;
