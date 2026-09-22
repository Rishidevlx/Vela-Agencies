import React, { useRef } from 'react';
import { FiPrinter, FiX, FiCheckCircle, FiTruck, FiPackage, FiMapPin, FiPhone, FiCalendar, FiFileText } from 'react-icons/fi';
import logoImg from '../../assets/logo-removebg-preview.png';

const TransportSlipModal = ({ entry, onClose }) => {
  const printRef = useRef(null);

  if (!entry) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = entry.booking_date 
    ? new Date(entry.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/40 flex items-center justify-center text-brand">
              <FiTruck className="text-lg text-yellow-400" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading tracking-wide">Transport Dispatch Slip</h2>
              <p className="text-xs text-slate-400">LR #{entry.lr_no || 'N/A'} • Inv #{entry.invoice_no || 'N/A'}</p>
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
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Printable Transport Slip Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 print:bg-white print:p-0 print:overflow-visible">
          
          <div 
            ref={printRef}
            className="printable-transport-slip bg-white border-2 border-slate-300 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm print:border print:border-black print:rounded-none print:shadow-none print:p-6 text-slate-900 font-body"
          >
            
            {/* Header: Company Details */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={logoImg} 
                  alt="Vela Agencies" 
                  className="h-16 w-auto object-contain shrink-0" 
                />
                <div>
                  <h1 className="text-2xl font-black font-heading text-slate-950 tracking-tight leading-none uppercase">
                    VELA AGENCIES
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mt-1">
                    Wholesale Fireworks & Crackers Suppliers
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs leading-snug">
                    S.No. 456/2C1B, D.No. 2/266, Alangulam, Vembakottai (Tk), Virudhunagar (Dt), Sivakasi - 626131
                  </p>
                </div>
              </div>

              <div className="text-right text-xs space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                <p className="font-bold text-slate-800 flex items-center justify-end gap-1.5">
                  <FiPhone className="text-slate-500 text-xs" /> +91 93639 53616
                </p>
                <p className="text-slate-600 text-[11px]">Ph: +91 73053 27400</p>
                <p className="text-[11px] text-blue-700 font-medium">www.velaagencies.com</p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="my-4 bg-slate-900 text-white text-center py-2 rounded font-heading font-black tracking-widest text-sm uppercase flex items-center justify-between px-4 print:bg-black print:text-white">
              <span>TRANSPORT DISPATCH CHALLAN</span>
              <span className="text-yellow-400 font-mono text-xs font-bold">
                STATUS: {entry.status?.toUpperCase() || 'FINISHED'}
              </span>
            </div>

            {/* 2-Column Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              
              {/* Left Column: Consignee / Customer Details */}
              <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 print:bg-white">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5 block mb-2.5 flex items-center gap-1.5">
                  <FiMapPin className="text-blue-700" /> Consignee (Customer Details)
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
                      <span className="font-mono font-bold text-slate-900">INV/#{entry.invoice_no}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Transport & LR Details */}
              <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 print:bg-white">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5 block mb-2.5 flex items-center gap-1.5">
                  <FiTruck className="text-blue-700" /> Carrier & Booking Info
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex">
                    <span className="w-24 font-bold text-slate-600 shrink-0">Transport:</span>
                    <span className="font-black text-slate-950 uppercase">{entry.transport_name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-slate-600 shrink-0">LR / GC No:</span>
                    <span className="font-mono font-black text-sm bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded text-slate-950">
                      {entry.lr_no || 'N/A'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-bold text-slate-600 shrink-0">Booking Date:</span>
                    <span className="font-semibold text-slate-800">{formattedDate}</span>
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
            <div className="border border-dashed border-slate-300 rounded-lg p-3 my-3 bg-amber-50/50 print:bg-white text-[10px] text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 mb-0.5">⚠️ Important Consignee Instructions:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Please bring original ID proof and this LR details when collecting goods from the transport branch office.</li>
                <li>Verify the total number of parcels/bundles ({entry.parcels || 1} units) before acknowledging receipt.</li>
                <li>For tracking inquiries or assistance, call Vela Agencies support: <strong>+91 93639 53616</strong>.</li>
              </ul>
            </div>

            {/* Signatures & Seal Section */}
            <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t-2 border-slate-800 text-xs">
              <div className="text-center">
                <div className="h-12 flex items-end justify-center">
                  <div className="w-40 border-b border-slate-400"></div>
                </div>
                <p className="font-bold text-slate-800 mt-1 uppercase text-[11px]">Consignee / Receiver's Signature</p>
                <p className="text-[10px] text-slate-400">Parcel Received in Good Condition</p>
              </div>

              <div className="text-center">
                <div className="h-12 flex items-end justify-center">
                  <span className="font-heading font-bold text-slate-900 text-xs tracking-wider opacity-60">
                    VELA AGENCIES
                  </span>
                </div>
                <p className="font-bold text-slate-900 mt-1 uppercase text-[11px]">For VELA AGENCIES</p>
                <p className="text-[10px] text-slate-500">Authorized Signatory / Dispatch Officer</p>
              </div>
            </div>

            {/* Bottom Barcode / Reference Strip */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-widest font-mono">
              <span>DOC-ID: TRP-{String(entry.id).padStart(5, '0')}</span>
              <span>Generated on: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>Vela Agencies Sivakasi</span>
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
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-transport-slip, .printable-transport-slip * {
            visibility: visible;
          }
          .printable-transport-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>

    </div>
  );
};

export default TransportSlipModal;
