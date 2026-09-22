import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiMessageCircle, FiCalendar, FiSearch, FiShoppingBag, FiTrash2, FiCheckSquare, FiDownload } from 'react-icons/fi';

const WhatsAppEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isFeatureActive, setIsFeatureActive] = useState(false);
  const [isUpdatingToggle, setIsUpdatingToggle] = useState(false);
  const [waSettings, setWaSettings] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch settings
      const settingsRes = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.data.whatsapp_settings) {
        setWaSettings(settingsData.data.whatsapp_settings);
        setIsFeatureActive(!!settingsData.data.whatsapp_settings.collect_mobile_number);
      }

      // Fetch enquiries
      const enqRes = await fetch(import.meta.env.VITE_API_URL + '/api/enquiries/whatsapp', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const enqData = await enqRes.json();
      if (enqData.success) {
        setEnquiries(enqData.data);
      } else {
        toast.error('Failed to fetch enquiries');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async () => {
    setIsUpdatingToggle(true);
    const newValue = !isFeatureActive;
    try {
      const token = localStorage.getItem('adminToken');
      const updatedSettings = {
        ...waSettings,
        collect_mobile_number: newValue
      };

      const res = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ whatsapp_settings: updatedSettings })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsFeatureActive(newValue);
        setWaSettings(updatedSettings);
        toast.success(`Mobile number collection ${newValue ? 'activated' : 'deactivated'}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating feature status:', error);
      toast.error('Network error while updating');
    } finally {
      setIsUpdatingToggle(false);
    }
  };


  const confirmDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800">Are you sure you want to delete this enquiry?</p>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              handleDelete(id);
            }} 
            className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 5000, style: { minWidth: '300px' } });
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/enquiries/whatsapp/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Enquiry deleted successfully');
        setEnquiries(enquiries.filter(enq => enq.id !== id));
        setSelectedIds(prev => prev.filter(selId => selId !== id));
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Network error while deleting');
    }
  };

  const handleBulkDelete = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800">Delete {selectedIds.length} selected enquiries?</p>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const token = localStorage.getItem('adminToken');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/enquiries/whatsapp/bulk-delete`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                  },
                  body: JSON.stringify({ ids: selectedIds })
                });
                const data = await res.json();
                if (data.success) {
                  toast.success(data.message || 'Enquiries deleted');
                  setEnquiries(enquiries.filter(enq => !selectedIds.includes(enq.id)));
                  setSelectedIds([]);
                } else {
                  toast.error(data.message || 'Failed to delete');
                }
              } catch (error) {
                console.error('Bulk delete error:', error);
                toast.error('Network error');
              }
            }} 
            className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
          >
            Delete All
          </button>
        </div>
      </div>
    ), { duration: 5000, style: { minWidth: '300px' } });
  };

  const handleBulkStatus = async (newStatus) => {
    if (!newStatus) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/enquiries/whatsapp/bulk-status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Status updated');
        setEnquiries(enquiries.map(enq => selectedIds.includes(enq.id) ? { ...enq, status: newStatus } : enq));
        setSelectedIds([]);
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Bulk status error:', error);
      toast.error('Network error');
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id]);
  };

  const toggleAllSelection = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEnquiries.map(enq => enq.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/enquiries/whatsapp/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Status updated');
        setEnquiries(enquiries.map(enq => enq.id === id ? { ...enq, status: newStatus } : enq));
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Network error');
    }
  };

  const filteredEnquiries = (enquiries || []).filter(enq => {
    const matchesSearch = enq?.mobile_number?.toString().includes(searchTerm);
    let matchesFrom = true;
    let matchesTo = true;
    const enqDate = new Date(enq.created_at);
    
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      matchesFrom = enqDate >= from;
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      matchesTo = enqDate <= to;
    }

    return matchesSearch && matchesFrom && matchesTo;
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Enquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all pre-checkout mobile numbers and cart data</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Feature Toggle */}
          <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm font-semibold text-gray-700">Collect Numbers</span>
            <button 
              onClick={handleToggleFeature}
              disabled={isUpdatingToggle}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                isFeatureActive ? 'bg-green-500' : 'bg-gray-300'
              } ${isUpdatingToggle ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="sr-only">Toggle mobile number collection</span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  isFeatureActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${isFeatureActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {isFeatureActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand text-sm text-gray-600"
              title="From Date"
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand text-sm text-gray-600"
              title="To Date"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Mobile No..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-brand text-white px-6 py-3 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row justify-between items-center animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3 sm:mb-0">
            <FiCheckSquare className="text-xl" />
            <span className="font-bold">{selectedIds.length} items selected</span>
          </div>
          <div className="flex items-center gap-3">
            <select 
              onChange={(e) => handleBulkStatus(e.target.value)}
              className="bg-white text-gray-800 text-sm font-semibold rounded-md px-3 py-1.5 outline-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Change Status</option>
              <option value="New">New</option>
              <option value="Connected">Connected</option>
              <option value="Enquiry Success">Enquiry Success</option>
            </select>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No enquiries found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="py-4 px-6 font-semibold w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer" 
                    checked={selectedIds.length === filteredEnquiries.length && filteredEnquiries.length > 0}
                    onChange={toggleAllSelection}
                  />
                </th>
                <th className="py-4 px-6 font-semibold">Enq. No</th>
                <th className="py-4 px-6 font-semibold">Date & Time</th>
                <th className="py-4 px-6 font-semibold">Customer Info</th>
                <th className="py-4 px-6 font-semibold">Cart Items</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map(enq => {
                let parsedCart = [];
                try {
                   parsedCart = typeof enq.cart_data === 'string' ? JSON.parse(enq.cart_data) : enq.cart_data;
                } catch(e) {}

                return (
                  <tr key={enq.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedIds.includes(enq.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="py-4 px-6">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 cursor-pointer"
                        checked={selectedIds.includes(enq.id)}
                        onChange={() => toggleSelection(enq.id)}
                      />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-bold">#{enq.enquiry_no || enq.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-400" />
                        {formatDate(enq.created_at)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      <div className="font-bold">{enq.customer_name || 'N/A'}</div>
                      <div className="text-gray-500 font-semibold text-xs mt-0.5">+91 {enq.mobile_number}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiShoppingBag className="text-gray-400" />
                        {parsedCart?.length || 0} items
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={enq.status || 'New'}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className={`text-sm border rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-brand focus:border-brand font-medium ${
                          enq.status === 'Enquiry Success' ? 'bg-green-50 text-green-700 border-green-200' :
                          enq.status === 'Connected' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Connected">Connected</option>
                        <option value="Enquiry Success">Enquiry Success</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {enq.invoice_url && (
                          <a 
                            href={enq.invoice_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-[#C70E17] text-white text-sm px-2 py-1.5 rounded shadow-sm hover:bg-red-800 transition-colors flex items-center gap-1"
                            title="View/Download Invoice"
                          >
                            <FiDownload />
                          </a>
                        )}
                        <button 
                          onClick={() => setSelectedEnquiry({ ...enq, parsedCart })}
                          className="text-brand hover:text-red-800 font-medium text-sm transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => confirmDelete(enq.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Details */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiMessageCircle className="text-brand" /> Enquiry #{selectedEnquiry.id}
              </h2>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="text-gray-400 hover:text-gray-800 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Customer Details</p>
                  <p className="font-bold text-gray-900">{selectedEnquiry.customer_name || 'N/A'}</p>
                  <p className="font-semibold text-gray-700 text-sm mt-1">+91 {selectedEnquiry.mobile_number}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Enquiry Info</p>
                  <p className="font-bold text-gray-800 text-sm">#{selectedEnquiry.enquiry_no || selectedEnquiry.id}</p>
                  <p className="font-semibold text-gray-700 text-sm mt-1">{formatDate(selectedEnquiry.created_at)}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                 <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Delivery Address</p>
                 <p className="text-sm text-gray-800">{selectedEnquiry.customer_address || 'Not provided'}</p>
              </div>

              <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Cart Data</h3>
              
              {selectedEnquiry.parsedCart && selectedEnquiry.parsedCart.length > 0 ? (
                <div className="space-y-3">
                  {selectedEnquiry.parsedCart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-brand">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No cart data available for this enquiry.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppEnquiries;
