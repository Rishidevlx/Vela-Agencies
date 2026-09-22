import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiSave, FiAlertCircle, FiCheck, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
const getImageUrl = (img) => {
  if (!img) return '';
  return img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
};

const ProductOffers = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Track edited products: { [productId]: { offer_price, offer_moq, is_offer_active, offer_start_date, offer_end_date, hasErrors } }
  const [editedProducts, setEditedProducts] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(editedProducts).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editedProducts]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/api/products?admin=true').then(res => res.json()),
        fetch(import.meta.env.VITE_API_URL + '/api/categories').then(res => res.json())
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter ? product.category_id === parseInt(categoryFilter) : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const calculateDiscount = (original, selling) => {
    if (!original || !selling) return 0;
    const orig = parseFloat(original);
    const sell = parseFloat(selling);
    if (orig <= 0 || sell >= orig) return 0;
    return Math.round(((orig - sell) / orig) * 100);
  };

  const handleEditChange = (productId, field, value) => {
    const product = products.find(p => p.id === productId);
    const currentEdits = editedProducts[productId] || {
      offer_price: product.offer_price || product.price,
      offer_moq: product.offer_moq || 1,
      is_offer_active: product.is_offer_active,
      offer_start_date: product.offer_start_date ? product.offer_start_date.substring(0, 16) : '',
      offer_end_date: product.offer_end_date ? product.offer_end_date.substring(0, 16) : '',
    };

    const newEdits = { ...currentEdits, [field]: value };
    
    // Validate
    let hasErrors = false;
    const newPrice = parseFloat(newEdits.offer_price);
    const originalPrice = parseFloat(product.price); // Normal selling price
    
    if (isNaN(newPrice) || newPrice < 0) hasErrors = true;
    if (!isNaN(originalPrice) && newPrice >= originalPrice) hasErrors = true; // Offer price must be < Selling Price

    newEdits.hasErrors = hasErrors;

    setEditedProducts(prev => ({
      ...prev,
      [productId]: newEdits
    }));
  };

  const handleBulkSave = async () => {
    const editsToSave = Object.keys(editedProducts).map(id => ({
      id: parseInt(id),
      ...editedProducts[id]
    }));

    if (editsToSave.length === 0) return;

    if (editsToSave.some(e => e.hasErrors)) {
      toast.error('Please fix errors (red fields) before saving');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/products/bulk-update-offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ offers: editsToSave })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Offers updated successfully!');
        setEditedProducts({});
        fetchData();
      } else {
        toast.error('Failed to update offers: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving offers:', error);
      toast.error('Failed to save some updates. Check console.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Offers</h1>
          <p className="text-sm text-gray-500">Manage discounts and offer durations</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBulkSave}
            disabled={Object.keys(editedProducts).length === 0 || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              Object.keys(editedProducts).length > 0 
                ? 'bg-[#3c50e0] text-white hover:bg-blue-700 shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiSave />
            {isSaving ? 'Saving...' : `Save ${Object.keys(editedProducts).length > 0 ? `(${Object.keys(editedProducts).length})` : 'Changes'}`}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3c50e0]"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:border-[#3c50e0] bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(editedProducts).length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 flex items-center gap-2 text-sm">
          <FiAlertCircle />
          You have unsaved changes. Click Save Changes to apply them.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Selling Price</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Offer Price</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Offer MOQ</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Schedule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading products...</td></tr>
            ) : currentItems.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400">No products found.</td></tr>
            ) : (
              currentItems.map(product => {
                const edits = editedProducts[product.id];
                const isEdited = !!edits;
                const hasErrors = edits?.hasErrors;
                
                const currentPrice = edits ? edits.offer_price : (product.offer_price || product.price);
                const currentMoq = edits ? edits.offer_moq : (product.offer_moq || 1);
                const isActive = edits ? edits.is_offer_active : product.is_offer_active;
                const startDate = edits ? edits.offer_start_date : (product.offer_start_date ? product.offer_start_date.substring(0, 16) : '');
                const endDate = edits ? edits.offer_end_date : (product.offer_end_date ? product.offer_end_date.substring(0, 16) : '');
                
                const discountPct = calculateDiscount(product.price, currentPrice);

                return (
                  <tr key={product.id} className={`${isEdited ? 'bg-blue-50/30' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getImageUrl(product.main_image)} 
                          alt={product.name}
                          className="w-10 h-10 rounded border object-cover"
                          onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23f3f4f6'/%3E%3Cpath d='M25 15c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-12h4v5h-4z' fill='%239ca3af'/%3E%3C/svg%3E"; }}
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-500">
                      ₹{product.price || '-'}
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                        <input 
                          type="number" 
                          value={currentPrice}
                          onChange={(e) => handleEditChange(product.id, 'offer_price', e.target.value)}
                          className={`w-28 pl-7 pr-2 py-1.5 rounded-md border text-sm focus:outline-none focus:ring-1 ${
                            hasErrors 
                              ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-[#3c50e0] focus:border-[#3c50e0]'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={currentMoq}
                        onChange={(e) => handleEditChange(product.id, 'offer_moq', e.target.value)}
                        className="w-20 px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#3c50e0] focus:border-[#3c50e0]"
                        min="1"
                      />
                      {discountPct > 0 && (
                        <div className="mt-1 text-[10px] text-green-600 font-bold">{discountPct}% OFF</div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isActive}
                          onChange={(e) => handleEditChange(product.id, 'is_offer_active', e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3c50e0]"></div>
                      </label>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <input 
                          type="datetime-local" 
                          value={startDate}
                          onChange={(e) => handleEditChange(product.id, 'offer_start_date', e.target.value)}
                          className="text-xs p-1.5 border border-gray-300 rounded text-gray-600 focus:outline-none focus:border-[#3c50e0]"
                          title="Start Date"
                        />
                        <input 
                          type="datetime-local" 
                          value={endDate}
                          onChange={(e) => handleEditChange(product.id, 'offer_end_date', e.target.value)}
                          className="text-xs p-1.5 border border-gray-300 rounded text-gray-600 focus:outline-none focus:border-[#3c50e0]"
                          title="End Date"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  currentPage === i + 1 ? 'bg-[#3c50e0] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOffers;
