import React, { useState, useEffect, useRef } from 'react';
import { FiPrinter, FiX, FiCheckCircle, FiTruck, FiPackage, FiMapPin, FiPhone, FiCalendar, FiFileText, FiMail, FiGlobe } from 'react-icons/fi';
import logoImg from '../../assets/WithoutBg-Logo.png';

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

const TransportSlipModal = ({ entry, onClose }) => {
  const printRef = useRef(null);

  // Dynamic Store Contact Details from Admin CMS
  const [storeDetails, setStoreDetails] = useState({
    address: 'SH 183, Kallamanaickerpatti, near alangulam 626131, virudhunagar , Tamil Nadu , India',
    phone1: '+91 93639 53616',
    phone2: '+91 73053 27400',
    email: 'hari953616@gmail.com',
    website: 'www.velaagencies.com'
  });

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.contact_details) {
          const cd = data.data.contact_details;
          setStoreDetails({
            address: cd.address || 'SH 183, Kallamanaickerpatti, near alangulam 626131, virudhunagar , Tamil Nadu , India',
            phone1: cd.phone1 || cd.phone || '+91 93639 53616',
            phone2: cd.phone2 || '+91 73053 27400',
            email: cd.email || 'hari953616@gmail.com',
            website: 'www.velaagencies.com'
          });
        }
      })
      .catch(err => console.error('Error fetching store details:', err));
  }, []);

  if (!entry) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = '';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  const formattedBookingDate = formatDateSafe(entry.booking_date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a8a] text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-yellow-400">
              <FiTruck className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading tracking-wide">Transport Dispatch Slip</h2>
              <p className="text-xs text-slate-300">LR #{entry.lr_no || 'N/A'} • Inv #{entry.invoice_no || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#F8B400] hover:bg-[#e0a200] text-gray-950 font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              <FiPrinter className="text-sm" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Printable Transport Slip Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 print:bg-white print:p-0 print:overflow-visible flex justify-center">
          
          <div 
            ref={printRef}
            className="printable-transport-slip bg-white border-2 border-slate-700 rounded-xl p-6 sm:p-8 w-full max-w-2xl mx-auto shadow-sm print:border-2 print:border-black print:rounded-none print:shadow-none print:p-6 print:mx-auto text-slate-900 font-body"
          >
            
            {/* Header: Company Details & Authentic Vela Agencies Logo (Centered & Balanced) */}
            <div className="flex flex-row items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={logoImg} 
                  alt="Vela Agencies" 
                  className="h-16 w-auto max-w-[150px] object-contain shrink-0 drop-shadow-sm" 
                />
                <div>
                  <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                    Wholesale Fireworks & Sivakasi Green Crackers Suppliers
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1 max-w-xs leading-snug">
                    {storeDetails.address}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs space-y-1 border-l border-slate-300 pl-4 shrink-0">
                <p className="font-bold text-slate-900 flex items-center justify-end gap-1">
                  <FiPhone className="text-slate-600 text-[10px]" /> {storeDetails.phone1}
                </p>
                {storeDetails.phone2 && (
                  <p className="text-slate-700 text-[11px] font-semibold flex items-center justify-end gap-1">
                    <FiPhone className="text-slate-500 text-[10px]" /> {storeDetails.phone2}
                  </p>
                )}
                <p className="text-[10px] text-slate-600 flex items-center justify-end gap-1">
                  <FiMail className="text-slate-400 text-[9px]" /> {storeDetails.email}
                </p>
                <p className="text-[10px] text-blue-700 font-bold flex items-center justify-end gap-1">
                  <FiGlobe className="text-blue-600 text-[9px]" /> {storeDetails.website}
                </p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="my-3.5 bg-[#1e3a8a] text-white text-center py-2 rounded font-heading font-black tracking-widest text-xs uppercase flex items-center justify-between px-4 print:bg-black print:text-white">
              <span>TRANSPORT DISPATCH CHALLAN / DELIVERY SLIP</span>
              <span className="text-yellow-400 font-mono text-[11px] font-bold">
                STATUS: {entry.status?.toUpperCase() || 'FINISHED'}
              </span>
            </div>

            {/* 2-Column Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3.5">
              
              {/* Left Column: Consignee / Customer Details */}
              <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 print:bg-white">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 block mb-2.5 flex items-center gap-1.5">
                  <FiMapPin className="text-[#C70E17]" /> Consignee (Customer Details)
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex">
                    <span className="w-24 font-bold text-slate-600 shrink-0">Name:</span>
                    <span className="font-black text-slate-950 uppercase">{entry.customer_name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-bold text-slate-600 shrink-0">Mobile:</span>
                    <span className="font-bold text-slate-900">{entry.customer_phone}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-bold text-slate-600 shrink-0">Destination:</span>
                    <span className="font-black text-blue-900 uppercase">{entry.transport_city}</span>
                  </div>
                  {entry.customer_address && (
                    <div className="flex items-start">
                      <span className="w-24 font-bold text-slate-600 shrink-0">Address:</span>
                      <span className="text-slate-700 leading-snug">{entry.customer_address}</span>
                    </div>
                  )}
                  {entry.invoice_no && (
                    <div className="flex pt-1 border-t border-slate-200/80">
                      <span className="w-24 font-bold text-slate-600 shrink-0">Invoice Ref:</span>
                      <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        INV/#{entry.invoice_no}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Transport & LR Details */}
              <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 print:bg-white">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 block mb-2.5 flex items-center gap-1.5">
                  <FiTruck className="text-[#C70E17]" /> Carrier & Booking Info
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex">
                    <span className="w-24 font-bold text-slate-600 shrink-0">Transport:</span>
                    <span className="font-black text-slate-950 uppercase">{entry.transport_name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-600 shrink-0">LR / GC No:</span>
                    <span className="font-mono font-black text-sm bg-yellow-100 border border-yellow-400 px-2 py-0.5 rounded text-slate-950">
                      {entry.lr_no || 'N/A'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-bold text-slate-600 shrink-0">Booking Date:</span>
                    <span className="font-bold text-slate-900">{formattedBookingDate}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-bold text-slate-600 shrink-0">No. of Parcels:</span>
                    <span className="font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {entry.parcels || 1} {Number(entry.parcels) > 1 ? 'Bundles / Boxes' : 'Bundle / Box'}
                    </span>
                  </div>
                  {entry.remarks && (
                    <div className="flex items-start pt-1 border-t border-slate-200/80">
                      <span className="w-24 font-bold text-slate-600 shrink-0">Remarks:</span>
                      <span className="text-slate-700 italic">{entry.remarks}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Note & Verification Block */}
            <div className="border border-dashed border-slate-300 rounded-lg p-3.5 my-3.5 bg-amber-50/50 print:bg-white text-[10.5px] text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 mb-1">⚠️ Important Consignee Instructions:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Please bring original ID proof and this LR details when collecting goods from the transport branch office.</li>
                <li>Verify the total number of parcels/bundles ({entry.parcels || 1} units) before acknowledging receipt.</li>
                <li>For tracking inquiries or assistance, call Vela Agencies support: <strong>{storeDetails.phone1}</strong>.</li>
              </ul>
            </div>

            {/* Bottom Barcode / Reference Strip */}
            <div className="mt-6 pt-3 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500 uppercase tracking-widest font-mono">
              <span>DOC-ID: TRP-{String(entry.id).padStart(5, '0')}</span>
              <span>LR: {entry.lr_no || 'N/A'}</span>
              <span>VELA AGENCIES SIVAKASI</span>
            </div>

          </div>

        </div>

        {/* Modal Bottom Footer Actions (Hidden in Print) */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <FiPrinter className="text-sm" />
            <span>Print Transport Slip</span>
          </button>
        </div>

      </div>

      {/* Print Specific CSS */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .printable-transport-slip, .printable-transport-slip * {
            visibility: visible;
          }
          .printable-transport-slip {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            margin: 0 auto !important;
            width: 96% !important;
            max-width: 680px !important;
            padding: 20px !important;
          }
        }
      `}</style>

    </div>
  );
};

export default TransportSlipModal;
