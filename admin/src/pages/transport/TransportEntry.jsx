import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiTruck, FiSearch, FiSave, FiRotateCcw, FiList, FiCheckCircle, 
  FiUser, FiPhone, FiMapPin, FiPackage, FiCalendar, FiFileText, FiTag 
} from 'react-icons/fi';

const POPULAR_TRANSPORTS = [
  'VRL Logistics',
  'ABT Parcel Service',
  'ARC Transport',
  'Supreme Logistics',
  'Rathimeena Parcel',
  'Royal Express',
  'KPN Speed Parcel',
  'ST Courier / Cargo',
  'Mettur Transports',
  'TAT Transport'
];

const TransportEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    invoice_no: '',
    transport_name: '',
    transport_city: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    lr_no: '',
    parcels: 1,
    booking_date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    remarks: ''
  });

  // If edit mode, load existing record
  useEffect(() => {
    if (editId) {
      fetchEntryDetails(editId);
    }
  }, [editId]);

  const fetchEntryDetails = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transport/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const item = data.data;
        setFormData({
          invoice_no: item.invoice_no || '',
          transport_name: item.transport_name || '',
          transport_city: item.transport_city || '',
          customer_name: item.customer_name || '',
          customer_phone: item.customer_phone || '',
          customer_address: item.customer_address || '',
          lr_no: item.lr_no || '',
          parcels: item.parcels || 1,
          booking_date: item.booking_date ? item.booking_date.split('T')[0] : new Date().toISOString().split('T')[0],
          status: item.status || 'Pending',
          remarks: item.remarks || ''
        });
      } else {
        toast.error('Failed to load transport entry');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching transport details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Auto-Lookup by Invoice Number
  const handleInvoiceLookup = async () => {
    if (!formData.invoice_no.trim()) {
      toast.error('Please enter an Invoice / Bill Number first');
      return;
    }

    try {
      setLookupLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transport/lookup/${encodeURIComponent(formData.invoice_no.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.data) {
        const d = data.data;
        setFormData(prev => ({
          ...prev,
          customer_name: d.customer_name || prev.customer_name,
          customer_phone: d.customer_phone || prev.customer_phone,
          customer_address: d.customer_address || prev.customer_address,
          transport_city: d.transport_city || prev.transport_city,
          booking_date: d.booking_date || prev.booking_date,
        }));
        toast.success(`Fetched customer details from Invoice #${formData.invoice_no}!`);
      } else {
        toast.error(data.message || 'Invoice not found in Outward Bills. You can enter details manually.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to lookup invoice');
    } finally {
      setLookupLoading(false);
    }
  };

  // Select Popular Transport Chip
  const handleSelectTransport = (name) => {
    setFormData(prev => ({ ...prev, transport_name: name }));
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      invoice_no: '',
      transport_name: '',
      transport_city: '',
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      lr_no: '',
      parcels: 1,
      booking_date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      remarks: ''
    });
    toast.success('Form reset');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.transport_name.trim()) {
      toast.error('Please enter or select Transport Name');
      return;
    }
    if (!formData.transport_city.trim()) {
      toast.error('Please enter Transport City / Destination');
      return;
    }
    if (!formData.customer_name.trim()) {
      toast.error('Please enter Customer Name');
      return;
    }
    if (!formData.customer_phone.trim()) {
      toast.error('Please enter Customer Phone Number');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const url = editId
        ? `${import.meta.env.VITE_API_URL}/api/transport/${editId}`
        : `${import.meta.env.VITE_API_URL}/api/transport`;

      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editId ? 'Transport entry updated successfully!' : 'Transport entry saved successfully!');
        navigate('/dashboard/transport/report');
      } else {
        toast.error(data.message || 'Failed to save transport entry');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving transport entry');
    } finally {
      setLoading(false);
    }
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
                {editId ? 'Edit Transport Entry' : 'Transport Dispatch Entry'}
              </h1>
              <p className="text-xs text-slate-500">Record shipment dispatches, LR numbers, and delivery details</p>
            </div>
          </div>
        </div>

        <Link
          to="/dashboard/transport/report"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer w-fit"
        >
          <FiList className="text-sm text-blue-700" />
          <span>View Transport Reports</span>
        </Link>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
        
        {/* Section 1: Invoice & Booking Reference */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <FiFileText className="text-blue-700" /> 1. Invoice & Booking Reference
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Invoice No with Lookup */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Invoice No (Optional)
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                <input
                  type="text"
                  name="invoice_no"
                  value={formData.invoice_no}
                  onChange={handleInputChange}
                  placeholder="e.g. 1001"
                  className="w-full px-3 py-2 text-sm outline-none bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleInvoiceLookup}
                  disabled={lookupLoading}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 text-xs font-bold border-l border-slate-300 flex items-center gap-1 shrink-0 cursor-pointer transition-colors disabled:opacity-50"
                  title="Auto-fill details from Outward Bill"
                >
                  <FiSearch className="text-xs" />
                  <span>{lookupLoading ? '...' : 'Fetch'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Type bill no and click Fetch to autofill</p>
            </div>

            {/* Booking Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FiCalendar className="text-slate-400" /> Booking Date
              </label>
              <input
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FiTag className="text-slate-400" /> Dispatch Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none font-bold ${
                  formData.status === 'Finished' || formData.status === 'Delivered'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : formData.status === 'In Transit'
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-amber-400 bg-amber-50 text-amber-900'
                }`}
              >
                <option value="Pending">🟡 Pending</option>
                <option value="In Transit">🔵 In Transit</option>
                <option value="Finished">🟢 Finished / Reached</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Transport & LR Details */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <FiTruck className="text-blue-700" /> 2. Transport & LR Details
          </h2>

          <div className="space-y-4">
            
            {/* Quick Transport Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Select Popular Transports:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TRANSPORTS.map((transport) => (
                  <button
                    key={transport}
                    type="button"
                    onClick={() => handleSelectTransport(transport)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer border ${
                      formData.transport_name === transport
                        ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {transport}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Transport Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Transport Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="transport_name"
                  value={formData.transport_name}
                  onChange={handleInputChange}
                  placeholder="e.g. VRL / ABT / ARC"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-medium"
                />
              </div>

              {/* Transport City / Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Transport City / Branch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="transport_city"
                  value={formData.transport_city}
                  onChange={handleInputChange}
                  placeholder="e.g. Chennai, Coimbatore, Madurai"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-medium"
                />
              </div>

              {/* LR No */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  LR Number / GC No
                </label>
                <input
                  type="text"
                  name="lr_no"
                  value={formData.lr_no}
                  onChange={handleInputChange}
                  placeholder="e.g. LR-987452"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-mono font-bold text-slate-900"
                />
              </div>

              {/* No of Parcels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FiPackage className="text-slate-400" /> No. of Parcels / Bundles
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  name="parcels"
                  value={formData.parcels}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-bold"
                />
              </div>

              {/* Remarks / Contact */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Remarks / Tracking Notes (Optional)
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="e.g. Direct booking, Door delivery requested, Call on arrival"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>

            </div>

          </div>
        </div>

        {/* Section 3: Customer / Consignee Details */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <FiUser className="text-blue-700" /> 3. Customer / Consignee Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                placeholder="Customer full name"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-medium"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FiPhone className="text-slate-400" /> Customer Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-medium"
              />
            </div>

            {/* Customer Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FiMapPin className="text-slate-400" /> Customer Address (Optional)
              </label>
              <textarea
                name="customer_address"
                value={formData.customer_address}
                onChange={handleInputChange}
                rows="2"
                placeholder="Delivery address / locality"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
              ></textarea>
            </div>

          </div>
        </div>

        {/* Bottom Form Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiRotateCcw className="text-xs" />
            <span>Reset Form</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <Link
              to="/dashboard/transport/report"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs uppercase tracking-wider text-center transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FiSave className="text-sm" />
              <span>{loading ? 'Saving...' : (editId ? 'Update Entry' : 'Save Transport Entry')}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default TransportEntry;
