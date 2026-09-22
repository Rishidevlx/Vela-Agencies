import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiTruck, FiPlus, FiSearch, FiPrinter, FiEdit2, FiTrash2, 
  FiClock, FiCheckCircle, FiCalendar, FiFilter, FiRefreshCw, 
  FiAlertCircle, FiX, FiCheck, FiPackage, FiPhone, FiMapPin 
} from 'react-icons/fi';
import TransportSlipModal from '../../components/transport/TransportSlipModal';

// Safe date formatter (eliminates timezone shift)
const formatDateSafe = (dateStr) => {
  if (!dateStr) return '-';
  const clean = dateStr.toString().split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[monthIndex]} ${year}`;
  }
  return dateStr;
};

const TransportReport = () => {
  const navigate = useNavigate();

  // Active Tab: 'pending' or 'finished'
  const [activeTab, setActiveTab] = useState('pending');

  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected entry for Slip Modal
  const [selectedSlipEntry, setSelectedSlipEntry] = useState(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, invoice_no: '', customer_name: '' });

  // Fetch Entries from Backend
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transport`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEntries(data.data);
      } else {
        toast.error('Failed to load transport reports');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to transport server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Filter entries into Pending vs Finished
  const pendingEntries = useMemo(() => {
    return entries.filter(e => {
      const s = (e.status || '').toLowerCase();
      return s === 'pending' || s === 'in transit' || s === 'dispatched';
    });
  }, [entries]);

  const finishedEntries = useMemo(() => {
    return entries.filter(e => {
      const s = (e.status || '').toLowerCase();
      return s === 'finished' || s === 'reached' || s === 'delivered';
    });
  }, [entries]);

  // Current tab active list with search & date filtering
  const currentTabList = useMemo(() => {
    const list = activeTab === 'pending' ? pendingEntries : finishedEntries;

    return list.filter(item => {
      // 1. Search Query Match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        (item.invoice_no && item.invoice_no.toString().toLowerCase().includes(q)) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(q)) ||
        (item.customer_phone && item.customer_phone.toLowerCase().includes(q)) ||
        (item.transport_name && item.transport_name.toLowerCase().includes(q)) ||
        (item.transport_city && item.transport_city.toLowerCase().includes(q)) ||
        (item.lr_no && item.lr_no.toLowerCase().includes(q))
      );

      // 2. Pure String Date Filtering (YYYY-MM-DD)
      const bookingDateStr = item.booking_date ? item.booking_date.toString().split('T')[0] : '';
      const matchFrom = !fromDate || (bookingDateStr >= fromDate);
      const matchTo = !toDate || (bookingDateStr <= toDate);

      return matchSearch && matchFrom && matchTo;
    });
  }, [activeTab, pendingEntries, finishedEntries, searchQuery, fromDate, toDate]);

  // Reset pagination on tab / filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, fromDate, toDate, itemsPerPage]);

  // Pagination Slice
  const totalPages = Math.ceil(currentTabList.length / itemsPerPage) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentTabList.slice(start, start + itemsPerPage);
  }, [currentTabList, currentPage, itemsPerPage]);

  // Handle Quick Status Change (Inline Table Dropdown)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transport/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setEntries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating status');
    }
  };

  // Delete Entry
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transport/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Transport entry deleted successfully');
        setEntries(prev => prev.filter(item => item.id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null, invoice_no: '', customer_name: '' });
      } else {
        toast.error(data.message || 'Failed to delete entry');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting transport entry');
    }
  };

  // Quick "Today" Date Filter
  const setTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
  };

  // Clear Filters
  const clearFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#f8fafc] min-h-screen font-body text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shadow-sm">
              <FiTruck className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
                Transport Dispatch Reports
              </h1>
              <p className="text-xs text-slate-500">Track shipments, LR receipts, and generate delivery slips</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEntries}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer shadow-sm"
            title="Refresh list"
          >
            <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/dashboard/transport/entry"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
          >
            <FiPlus className="text-sm" />
            <span>New Transport Entry</span>
          </Link>
        </div>
      </div>

      {/* Main Tabs (Pending vs Finished) */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200">
        
        {/* Tab 1: Pending */}
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'border-amber-500 text-amber-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FiClock className={activeTab === 'pending' ? 'text-amber-500' : 'text-slate-400'} />
          <span>Pending Shipments</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
            activeTab === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {pendingEntries.length}
          </span>
        </button>

        {/* Tab 2: Finished / Reached */}
        <button
          onClick={() => setActiveTab('finished')}
          className={`pb-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'finished'
              ? 'border-emerald-600 text-emerald-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FiCheckCircle className={activeTab === 'finished' ? 'text-emerald-600' : 'text-slate-400'} />
          <span>Finished / Reached</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
            activeTab === 'finished' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {finishedEntries.length}
          </span>
        </button>

      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Bar */}
          <div className="lg:col-span-4 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Invoice #, Customer, LR #, Transport, City..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
            />
          </div>

          {/* Date Range: From Date */}
          <div className="lg:col-span-2 relative">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-700"
            />
          </div>

          {/* Date Range: To Date */}
          <div className="lg:col-span-2 relative">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-700"
            />
          </div>

          {/* Quick Date Buttons */}
          <div className="lg:col-span-2 flex items-end gap-1.5 pt-3 sm:pt-0">
            <button
              onClick={setTodayFilter}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Today
            </button>
            {(searchQuery || fromDate || toDate) && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
              >
                <FiX className="text-xs" /> Clear
              </button>
            )}
          </div>

          {/* Records per page selector */}
          <div className="lg:col-span-2 flex items-center justify-end gap-2 text-xs text-slate-500 pt-3 sm:pt-0">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-900 text-white font-heading font-black tracking-wider uppercase text-[11px] border-b border-slate-800">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">Inv No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Transport</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Customer Info</th>
                <th className="py-3 px-3 font-mono">LR Number</th>
                <th className="py-3 px-3 text-center">Parcels</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center w-32">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-blue-600" />
                    <span>Loading transport records...</span>
                  </td>
                </tr>
              ) : paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 font-medium">
                    No {activeTab} transport shipments found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((item, idx) => {
                  const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const dateFormatted = formatDateSafe(item.booking_date);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Index */}
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {itemIndex}
                      </td>

                      {/* Invoice No */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {item.invoice_no ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            #{item.invoice_no}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">None</span>
                        )}
                      </td>

                      {/* Booking Date */}
                      <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      {/* Transport Name */}
                      <td className="py-3 px-3 font-bold text-slate-900 uppercase">
                        {item.transport_name}
                      </td>

                      {/* Destination City */}
                      <td className="py-3 px-3 font-semibold text-blue-900 uppercase">
                        {item.transport_city}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-950 uppercase">{item.customer_name}</span>
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <FiPhone className="text-[9px]" /> {item.customer_phone}
                          </span>
                        </div>
                      </td>

                      {/* LR Number */}
                      <td className="py-3 px-3 font-mono">
                        {item.lr_no ? (
                          <span className="font-bold text-xs bg-yellow-50 text-slate-900 border border-yellow-200 px-1.5 py-0.5 rounded">
                            {item.lr_no}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">No LR</span>
                        )}
                      </td>

                      {/* Parcels */}
                      <td className="py-3 px-3 text-center font-black text-slate-800">
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-100">
                          {item.parcels || 1}
                        </span>
                      </td>

                      {/* Status Selector / Dropdown */}
                      <td className="py-3 px-3 text-center">
                        <select
                          value={item.status || 'Pending'}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-md font-bold outline-none border cursor-pointer ${
                            item.status === 'Finished' || item.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.status === 'In Transit'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Pending">🟡 Pending</option>
                          <option value="In Transit">🔵 In Transit</option>
                          <option value="Finished">🟢 Finished</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Print Slip Button */}
                          <button
                            onClick={() => setSelectedSlipEntry(item)}
                            className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer border border-blue-200"
                            title="Print / View Transport Delivery Slip"
                          >
                            <FiPrinter className="text-sm" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => navigate(`/dashboard/transport/entry?id=${item.id}`)}
                            className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer border border-slate-200"
                            title="Edit Record"
                          >
                            <FiEdit2 className="text-sm" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteModal({
                              isOpen: true,
                              id: item.id,
                              invoice_no: item.invoice_no,
                              customer_name: item.customer_name
                            })}
                            className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer border border-red-200"
                            title="Delete Record"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {currentTabList.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, currentTabList.length)}</span> of{' '}
              <span className="font-bold text-slate-900">{currentTabList.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-300 rounded-md font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              
              <span className="px-2 font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-300 rounded-md font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Printable Transport Slip Modal */}
      {selectedSlipEntry && (
        <TransportSlipModal
          entry={selectedSlipEntry}
          onClose={() => setSelectedSlipEntry(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-scale-up">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Transport Entry?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to delete transport entry for <strong>{deleteModal.customer_name}</strong> {deleteModal.invoice_no ? `(Inv #${deleteModal.invoice_no})` : ''}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: null, invoice_no: '', customer_name: '' })}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransportReport;
