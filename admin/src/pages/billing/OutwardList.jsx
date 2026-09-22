import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiSearch, FiPrinter, FiEdit3, FiTrash2, 
  FiCalendar, FiPlus, FiRefreshCw, FiX, FiChevronLeft, FiChevronRight,
  FiPhone, FiMapPin
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Helper to reliably format any date to YYYY-MM-DD
const getNormalizedDateStr = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
      return dateVal.substring(0, 10);
    }
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
  }
};

const OutwardList = () => {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Selection for bulk delete
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Pagination State (10 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Bills
  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/billing', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBills(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch outward bills:', err);
      toast.error('Failed to load outward bills');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Filtered Bills with Fixed Date Normalization
  const filteredBills = bills.filter(bill => {
    const query = searchQuery.toLowerCase().trim();
    const billDateNorm = getNormalizedDateStr(bill.bill_date);

    const matchesQuery = !query || 
      (bill.bill_no && bill.bill_no.toString().includes(query)) ||
      (bill.customer_name && bill.customer_name.toLowerCase().includes(query)) ||
      (bill.phone_number && bill.phone_number.includes(query)) ||
      (bill.city && bill.city.toLowerCase().includes(query));

    const matchesDate = selectedDate ? (billDateNorm === selectedDate) : true;

    return matchesQuery && matchesDate;
  });

  // Reset current page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDate]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage) || 1;
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Direct In-Browser Print Generator (No Cloudinary redirect, triggers print dialog)
  const handlePrintBill = (bill) => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print invoice.');
      return;
    }

    let parsedItems = [];
    if (typeof bill.items === 'string') {
      try { parsedItems = JSON.parse(bill.items); } catch(e) {}
    } else if (Array.isArray(bill.items)) {
      parsedItems = bill.items;
    }

    const invoiceDateStr = bill.bill_date ? new Date(bill.bill_date).toLocaleDateString('en-IN') : '-';

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${bill.bill_no} - Vela Agencies</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            body { padding: 32px; color: #1e293b; background: #fff; line-height: 1.4; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 20px; }
            .logo-area h1 { color: #c70e17; font-size: 26px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
            .logo-area p { color: #475569; font-size: 13px; margin-top: 3px; }
            .invoice-meta { text-align: right; }
            .invoice-meta h2 { font-size: 20px; color: #0f172a; margin-bottom: 4px; font-weight: 800; }
            .invoice-meta p { font-size: 13px; color: #475569; margin: 2px 0; }
            .parties { display: flex; justify-content: space-between; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 24px; }
            .party-col { flex: 1; font-size: 13px; }
            .party-col h3 { font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 6px; font-weight: 700; letter-spacing: 0.5px; }
            .party-col p { margin: 2px 0; color: #1e293b; }
            .party-col strong { font-size: 14px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th { background: #f1f5f9; color: #334155; font-weight: 700; text-transform: uppercase; font-size: 11px; padding: 9px 12px; border: 1px solid #cbd5e1; }
            td { padding: 9px 12px; border: 1px solid #e2e8f0; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary-table { width: 320px; margin-left: auto; margin-bottom: 25px; font-size: 13px; }
            .summary-table td { padding: 6px 12px; border: none; }
            .grand-total { font-size: 16px; font-weight: 800; color: #0f172a; border-top: 2px solid #0f172a !important; padding-top: 8px !important; }
            .footer { margin-top: 35px; border-top: 1px dashed #cbd5e1; padding-top: 15px; text-align: center; font-size: 12px; color: #64748b; }
            @media print {
              body { padding: 0; }
              @page { margin: 12mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-area">
              <h1>VELA AGENCIES</h1>
              <p>Direct Sivakasi Manufacturer Deals • Wholesale Crackers</p>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Sivakasi, Tamil Nadu, India</p>
            </div>
            <div class="invoice-meta">
              <h2>OUTWARD INVOICE</h2>
              <p><strong>Invoice #:</strong> ${bill.bill_no}</p>
              <p><strong>Date:</strong> ${invoiceDateStr}</p>
            </div>
          </div>

          <div class="parties">
            <div class="party-col">
              <h3>Billed To (Customer):</h3>
              <p><strong>${bill.customer_name || 'Walk-in Customer'}</strong></p>
              <p>Ph: +91 ${bill.phone_number || 'N/A'}</p>
              <p>${bill.address || ''}</p>
              <p>${bill.city || ''} ${bill.pincode ? `- ${bill.pincode}` : ''}</p>
            </div>
            <div class="party-col" style="text-align: right;">
              <h3>Billed From:</h3>
              <p><strong>VELA AGENCIES (From)</strong></p>
              <p>Sivakasi - 626123, Tamil Nadu</p>
              <p>Ph: +91 94430 25873 / +91 80568 18873</p>
              <p>Email: velaagencies55siva@gmail.com</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 40px;">#</th>
                <th>Product Description</th>
                <th class="text-right" style="width: 110px;">Rate (₹)</th>
                <th class="text-center" style="width: 80px;">Qty</th>
                <th class="text-center" style="width: 80px;">Unit</th>
                <th class="text-right" style="width: 120px;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${parsedItems.map((item, idx) => `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td><strong>${item.name}</strong></td>
                  <td class="text-right">₹${Number(item.price).toFixed(2)}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-center">${item.unit || 'pkt'}</td>
                  <td class="text-right">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table class="summary-table">
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">₹${Number(bill.subtotal).toFixed(2)}</td>
            </tr>
            ${Number(bill.discount) > 0 ? `
              <tr>
                <td style="color: #c70e17;">Discount:</td>
                <td class="text-right" style="color: #c70e17;">-₹${Number(bill.discount).toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr class="grand-total">
              <td>Grand Total:</td>
              <td class="text-right">₹${Number(bill.grand_total).toFixed(2)}</td>
            </tr>
          </table>

          <div class="footer">
            <p>Thank you for choosing Vela Agencies Sivakasi!</p>
            <p style="margin-top: 4px; font-size: 11px; color: #94a3b8;">This is a computer generated invoice and does not require a physical signature.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  // Delete Single Bill
  const handleDeleteBill = async (id, billNo) => {
    if (!window.confirm(`Are you sure you want to delete Invoice #${billNo}?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Bill #${billNo} deleted successfully`);
        setBills(prev => prev.filter(b => b.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
      } else {
        toast.error(data.message || 'Failed to delete bill');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting bill');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected bills?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${selectedIds.length} bills deleted successfully`);
        setBills(prev => prev.filter(b => !selectedIds.includes(b.id)));
        setSelectedIds([]);
      } else {
        toast.error(data.message || 'Failed to bulk delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error bulk deleting');
    }
  };

  // Select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedBills.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Select single checkbox
  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Stats Calculations (Accurate normalized today date)
  const totalRevenue = bills.reduce((sum, b) => sum + (parseFloat(b.grand_total) || 0), 0);
  const todayNormalizedStr = getNormalizedDateStr(new Date());
  const todayBills = bills.filter(b => getNormalizedDateStr(b.bill_date) === todayNormalizedStr);
  const todayRevenue = todayBills.reduce((sum, b) => sum + (parseFloat(b.grand_total) || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#f8fafc] min-h-screen font-body text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Outward Invoices List
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer bills, print invoices directly, edit details and view sales records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBills}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>

          <Link
            to="/dashboard/billing/outward"
            className="flex items-center gap-2 px-5 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow transition-all cursor-pointer"
          >
            <FiPlus className="text-sm" /> Create New Bill
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Invoices */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Bills</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-heading">{bills.length}</h3>
          </div>
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-lg">
            <FiFileText />
          </div>
        </div>

        {/* Total Billed Revenue */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <h3 className="text-2xl font-bold text-blue-900 mt-1 font-heading">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold">
            ₹
          </div>
        </div>

        {/* Today's Bills */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Bills</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-heading">{todayBills.length}</h3>
          </div>
          <div className="w-10 h-10 rounded bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            <FiCalendar />
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1 font-heading">
              ₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold">
            ₹
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            placeholder="Search by Invoice #, Customer Name, Phone, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded pl-10 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-sm"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        </div>

        {/* Date Filter & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <FiCalendar className="text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-xs"
            />
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')} 
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                title="Clear date filter"
              >
                <FiX />
              </button>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow"
            >
              <FiTrash2 /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedBills.length > 0 && paginatedBills.every(b => selectedIds.includes(b.id))}
                    className="rounded border-slate-300 text-blue-700 focus:ring-blue-700 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-24">Invoice #</th>
                <th className="py-3 px-3 w-28">Date</th>
                <th className="py-3 px-4 min-w-[220px]">Customer Details</th>
                <th className="py-3 px-3 w-24 text-center">Items</th>
                <th className="py-3 px-3 w-32 text-right">Grand Total</th>
                <th className="py-3 px-4 w-36 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-medium">
                    <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading outward bills...
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-medium">
                    No outward bills found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(bill.id)}
                        onChange={() => handleSelectOne(bill.id)}
                        className="rounded border-slate-300 text-blue-700 focus:ring-blue-700 cursor-pointer"
                      />
                    </td>

                    {/* Bill Number */}
                    <td className="py-3 px-3 font-bold text-blue-900 font-mono text-xs">
                      #{bill.bill_no}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {bill.bill_date ? new Date(bill.bill_date).toLocaleDateString('en-IN') : '-'}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{bill.customer_name || 'Walk-in Customer'}</div>
                      {bill.phone_number && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <FiPhone className="text-slate-400" /> +91 {bill.phone_number}
                        </div>
                      )}
                      {bill.city && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <FiMapPin className="text-slate-400" /> {bill.city} {bill.pincode ? `- ${bill.pincode}` : ''}
                        </div>
                      )}
                    </td>

                    {/* Total Items */}
                    <td className="py-3 px-3 text-center">
                      <span className="bg-slate-100 font-semibold px-2.5 py-1 rounded text-slate-800 text-[11px]">
                        {bill.total_items || 1} units
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-3 text-right font-extrabold text-blue-900 text-sm">
                      ₹{Number(bill.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Actions: ONLY Clean Icons (Print • Edit • Delete) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* 1. PRINT / DOWNLOAD OFFICIAL PDF (Exact WhatsApp Enquiry Format) */}
                        {bill.invoice_url ? (
                          <a
                            href={bill.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 transition-colors shadow-sm cursor-pointer"
                            title="Print / View Official Invoice PDF"
                          >
                            <FiPrinter className="text-sm" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePrintBill(bill)}
                            className="w-8 h-8 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 transition-colors shadow-sm cursor-pointer"
                            title="Print Invoice"
                          >
                            <FiPrinter className="text-sm" />
                          </button>
                        )}

                        {/* 2. EDIT ICON */}
                        <Link
                          to={`/dashboard/billing/outward?editId=${bill.id}`}
                          className="w-8 h-8 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200 transition-colors shadow-sm cursor-pointer"
                          title="Edit Invoice"
                        >
                          <FiEdit3 className="text-sm" />
                        </Link>

                        {/* 3. DELETE ICON */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBill(bill.id, bill.bill_no)}
                          className="w-8 h-8 rounded-md bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center border border-red-200 transition-colors shadow-sm cursor-pointer"
                          title="Delete Invoice"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <div>
            Showing <strong className="text-slate-900">{filteredBills.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredBills.length)}</strong> of <strong className="text-slate-900">{filteredBills.length}</strong> entries (Total: ₹{filteredBills.reduce((sum, b) => sum + (parseFloat(b.grand_total) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})
          </div>

          {/* Pagination Controls (10 records per page) */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-sm"
              >
                <FiChevronLeft /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded border text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-sm"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default OutwardList;
