import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiEdit2, FiTrash2, FiPlus, FiFilter, 
  FiCheckSquare, FiSquare, FiCheck, FiAlertTriangle, FiX, FiFolder
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [websiteSortOrder, setWebsiteSortOrder] = useState('default');
  const [generalSettings, setGeneralSettings] = useState({});
  
  // Dropdown UI States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
  
  // Professional Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'single', // 'single' | 'bulk'
    id: null,
    name: '',
    count: 0,
    isDeleting: false
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const data = await response.json();
      if (data.success && data.data.general_settings) {
        setGeneralSettings(data.data.general_settings);
        setWebsiteSortOrder(data.data.general_settings.product_sort_order || 'default');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateWebsiteSortOrder = async (order) => {
    setWebsiteSortOrder(order);
    try {
      const token = localStorage.getItem('adminToken');
      const updatedSettings = { ...generalSettings, product_sort_order: order };
      
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ general_settings: updatedSettings })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Website sorting updated to ${order === 'recent' ? 'Recent First' : 'Default'}`);
        setGeneralSettings(updatedSettings);
      } else {
        toast.error('Failed to update sorting');
      }
    } catch (err) {
      toast.error('Error updating sorting');
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/products?admin=true');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Server error while loading products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Select by specific Category
  const handleSelectCategoryProducts = (catId) => {
    const targetCatId = parseInt(catId);
    const catProductIds = products
      .filter(p => p.category_id === targetCatId)
      .map(p => p.id);

    if (catProductIds.length === 0) {
      toast.error('No products found in this category');
      return;
    }

    // Toggle select/deselect
    const allSelected = catProductIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !catProductIds.includes(id)));
      toast.success(`Deselected ${catProductIds.length} products`);
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...catProductIds])));
      toast.success(`Selected all ${catProductIds.length} products from category`);
    }
  };

  // Bulk Assign Category
  const handleBulkCategoryAssign = async (targetCatId) => {
    if (selectedIds.length === 0) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/products/bulk-category', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, category_id: targetCatId ? parseInt(targetCatId) : null })
      });
      const data = await response.json();
      
      if (data.success) {
        const catName = categories.find(c => c.id === parseInt(targetCatId))?.name || 'Uncategorized';
        toast.success(`Moved ${selectedIds.length} product(s) to "${catName}"`);
        setSelectedIds([]);
        setIsBulkCategoryOpen(false);
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to update category');
      }
    } catch (error) {
      toast.error('Error updating category in bulk');
    }
  };

  // Trigger Modal for Bulk Delete
  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: 'bulk',
      id: null,
      name: '',
      count: selectedIds.length,
      isDeleting: false
    });
  };

  // Trigger Modal for Single Delete
  const openSingleDeleteModal = (product) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      id: product.id,
      name: product.name,
      count: 1,
      isDeleting: false
    });
  };

  // Confirm Delete Execution (Professional Modal Action)
  const confirmDeleteExecution = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    const token = localStorage.getItem('adminToken');

    try {
      if (deleteModal.type === 'bulk') {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/products/bulk', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ids: selectedIds })
        });
        const data = await response.json();
        
        if (data.success) {
          toast.success(data.message || `${selectedIds.length} products deleted successfully`);
          setSelectedIds([]);
          fetchProducts();
        } else {
          toast.error(data.message || 'Failed to delete products');
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${deleteModal.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          toast.success('Product deleted successfully');
          fetchProducts();
        } else {
          toast.error(data.message || 'Failed to delete product');
        }
      }
    } catch (error) {
      toast.error('Error deleting product');
    } finally {
      setDeleteModal({ isOpen: false, type: 'single', id: null, name: '', count: 0, isDeleting: false });
    }
  };

  const handleBulkStatus = async (status) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/products/bulk-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, status })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setSelectedIds([]);
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/products/bulk-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: [id], status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchProducts();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  // Filtering
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? product.category_id === parseInt(categoryFilter) : true;
    const matchesStatus = statusFilter ? product.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/50';
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL}${img}`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-800">All Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your catalog, prices, and stock.</p>
        </div>
        <Link 
          to="/dashboard/products/add" 
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
        >
          <FiPlus /> Add New Product
        </Link>
      </div>

      {/* Website Display Order Banner */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Website Display Order</h3>
          <p className="text-xs text-gray-500">Choose how products are ordered on the frontend shop page.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => updateWebsiteSortOrder('default')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${websiteSortOrder === 'default' ? 'bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Normal List Order
          </button>
          <button 
            onClick={() => updateWebsiteSortOrder('recent')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${websiteSortOrder === 'recent' ? 'bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Recent Uploads First
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Top Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-700 transition-colors bg-white text-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            
            {/* Custom Category Dropdown with "Select All in Category" Option */}
            <div className="relative min-w-[170px]">
              <button 
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsStatusOpen(false); }}
                className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm hover:border-blue-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FiFilter className={categoryFilter ? "text-blue-700" : "text-gray-400"} />
                  <span className="truncate max-w-[130px]">
                    {categoryFilter === '' ? 'All Categories' : categories.find(c => c.id === parseInt(categoryFilter))?.name || 'Category'}
                  </span>
                </div>
                <svg className={`h-4 w-4 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              
              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-100 rounded-lg shadow-2xl z-50 py-1 max-h-72 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filter by Category</span>
                      <button 
                        onClick={() => { setCategoryFilter(''); setIsCategoryOpen(false); setCurrentPage(1); }}
                        className="text-xs text-blue-700 font-semibold hover:underline"
                      >
                        Reset
                      </button>
                    </div>

                    <button 
                      onClick={() => { setCategoryFilter(''); setIsCategoryOpen(false); setCurrentPage(1); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className={categoryFilter === '' ? 'font-medium text-blue-700' : 'text-gray-700'}>All Categories</span>
                      {categoryFilter === '' && <FiCheck className="text-blue-700" />}
                    </button>

                    {categories.map(cat => {
                      const count = products.filter(p => p.category_id === cat.id).length;
                      return (
                        <div key={cat.id} className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                          <button 
                            onClick={() => { setCategoryFilter(cat.id.toString()); setIsCategoryOpen(false); setCurrentPage(1); }}
                            className="flex-1 text-left text-sm text-gray-700 hover:text-blue-700 truncate mr-2"
                          >
                            <span className={categoryFilter === cat.id.toString() ? 'font-bold text-blue-700' : ''}>
                              {cat.name} ({count})
                            </span>
                          </button>
                          
                          {/* Quick Select All in Category button */}
                          {count > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCategoryProducts(cat.id);
                              }}
                              className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded hover:bg-blue-100 transition-colors shrink-0"
                              title={`Select all ${count} products in ${cat.name}`}
                            >
                              Select ({count})
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            
            {/* Custom Status Dropdown */}
            <div className="relative min-w-[130px]">
              <button 
                onClick={() => { setIsStatusOpen(!isStatusOpen); setIsCategoryOpen(false); }}
                className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm hover:border-blue-700 transition-colors cursor-pointer"
              >
                <span>
                  {statusFilter === '' ? 'All Status' : statusFilter === 'active' ? 'Active' : 'Inactive'}
                </span>
                <svg className={`h-4 w-4 text-gray-400 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              
              {isStatusOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1">
                    {[
                      { value: '', label: 'All Status' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ].map(status => (
                      <button 
                        key={status.value}
                        onClick={() => { setStatusFilter(status.value); setIsStatusOpen(false); setCurrentPage(1); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                      >
                        <span className={statusFilter === status.value ? 'font-medium text-blue-700' : 'text-gray-700'}>{status.label}</span>
                        {statusFilter === status.value && <FiCheck className="text-blue-700" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Bulk Action Bar (Category Assignment + Status + Delete) */}
        {selectedIds.length > 0 && (
          <div className="px-6 py-3 bg-blue-50/90 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <FiCheckSquare className="text-blue-700 text-base" />
              {selectedIds.length} product(s) selected
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Bulk Category Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBulkCategoryOpen(!isBulkCategoryOpen)}
                  className="text-xs font-bold px-3 py-1.5 bg-white border border-blue-300 text-blue-800 hover:bg-blue-50 rounded-md shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FiFolder className="text-blue-600" /> Move Category ▼
                </button>

                {isBulkCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsBulkCategoryOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-1 max-h-60 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                        Assign to Category
                      </div>
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleBulkCategoryAssign(cat.id)}
                          className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors font-medium cursor-pointer"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Mark Active */}
              <button 
                onClick={() => handleBulkStatus('active')}
                className="text-xs font-bold px-3 py-1.5 bg-white border border-blue-200 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer shadow-sm"
              >
                Mark Active
              </button>

              {/* Mark Inactive */}
              <button 
                onClick={() => handleBulkStatus('inactive')}
                className="text-xs font-bold px-3 py-1.5 bg-white border border-blue-200 text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer shadow-sm"
              >
                Mark Inactive
              </button>

              <div className="w-px h-5 bg-blue-200 mx-1"></div>

              {/* Delete Selected (Opens Professional Modal) */}
              <button 
                onClick={openBulkDeleteModal}
                className="text-xs font-bold px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              >
                <FiTrash2 /> Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto w-full scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer text-blue-700 border-gray-300 rounded focus:ring-blue-700"
                  />
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading products...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-400 text-2xl">
                        <FiSearch />
                      </div>
                      <p className="font-medium">No products found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(product.id)}
                        onChange={() => handleSelectRow(product.id)}
                        className="w-4 h-4 cursor-pointer text-blue-700 border-gray-300 rounded focus:ring-blue-700"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                          <img 
                            src={getImageUrl(product.main_image)} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23f3f4f6'/%3E%3Cpath d='M25 15c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-12h4v5h-4z' fill='%239ca3af'/%3E%3C/svg%3E"; }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">
                      {product.category_name ? (
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded text-xs">
                          {product.category_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Uncategorized</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">₹{parseFloat(product.price).toFixed(2)}</span>
                        {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                          <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.original_price).toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleStatus(product.id, product.status)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
                          product.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {product.status === 'active' ? (
                          <><FiCheck className="mr-1" /> Active</>
                        ) : (
                          'Inactive'
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button 
                          onClick={() => openSingleDeleteModal(product)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-800">{indexOfFirstItem + 1}</span> to <span className="font-medium text-gray-800">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="font-medium text-gray-800">{filteredProducts.length}</span> results
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                Prev
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === i + 1 
                      ? 'bg-blue-700 text-white border border-blue-700 font-bold' 
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
      </div>

      {/* Professional Confirmation Modal Popup (Replaces Browser Alert) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden relative animate-fade-in">
            <div className="p-6">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <FiAlertTriangle className="text-2xl" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold font-heading text-gray-900">
                    {deleteModal.type === 'bulk' 
                      ? `Delete ${deleteModal.count} Selected Products?` 
                      : `Delete "${deleteModal.name}"?`
                    }
                  </h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    {deleteModal.type === 'bulk'
                      ? `Are you sure you want to delete these ${deleteModal.count} products from your catalog? This action is permanent and cannot be undone.`
                      : `Are you sure you want to delete this product? It will be removed from your catalog immediately.`
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, type: 'single', id: null, name: '', count: 0, isDeleting: false })}
                  disabled={deleteModal.isDeleting}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteExecution}
                  disabled={deleteModal.isDeleting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {deleteModal.isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 /> Yes, Delete
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllProducts;
