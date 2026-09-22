const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const generateTransportSlip = async (entry, storeDetails = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });

      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);

        // Upload to Cloudinary using upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'transport_slips',
            public_id: `transport_slip_${entry.id}_${entry.lr_no || Date.now()}`,
            format: 'pdf',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Transport Slip Upload Error:', error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        uploadStream.end(pdfData);
      });

      // Local Logo path
      const localLogoPath = path.join(__dirname, '../assets/WithoutBg-Logo.png');
      const hasLocalLogo = fs.existsSync(localLogoPath);

      // Contact details fallback
      const phone1 = storeDetails.phone1 || storeDetails.phone || '+91 93639 53616';
      const phone2 = storeDetails.phone2 || '+91 73053 27400';
      const email = storeDetails.email || 'hari953616@gmail.com';
      const address = storeDetails.address || 'SH 183, Kallamanaickerpatti, near alangulam 626131, virudhunagar, Tamil Nadu, India';
      const website = storeDetails.website || 'www.velaagencies.com';

      // Page boundary box
      doc.rect(40, 40, 515, 760).lineWidth(1.5).stroke('#1e293b');

      // 1. Header Section
      let currentY = 55;
      if (hasLocalLogo) {
        doc.image(localLogoPath, 55, currentY, { width: 140 });
      }

      // Store Details (Right aligned)
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a')
        .text(`Ph: ${phone1}${phone2 ? ' / ' + phone2 : ''}`, 260, currentY + 5, { align: 'right', width: 280 });
      doc.fontSize(8).font('Helvetica').fillColor('#475569')
        .text(`Email: ${email}`, 260, currentY + 20, { align: 'right', width: 280 })
        .text(`Web: ${website}`, 260, currentY + 33, { align: 'right', width: 280 });
      
      doc.fontSize(7.5).font('Helvetica').fillColor('#64748b')
        .text(address, 260, currentY + 46, { align: 'right', width: 280 });

      currentY = 135;
      doc.moveTo(40, currentY).lineTo(555, currentY).lineWidth(1).stroke('#cbd5e1');

      // 2. Document Title Banner
      currentY += 10;
      doc.rect(50, currentY, 495, 26).fill('#1e3a8a');
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
        .text('TRANSPORT DISPATCH CHALLAN / DELIVERY SLIP', 65, currentY + 8);
      doc.fillColor('#fde047').fontSize(9).font('Helvetica-Bold')
        .text(`STATUS: ${(entry.status || 'FINISHED').toUpperCase()}`, 380, currentY + 8, { align: 'right', width: 155 });

      // 3. Two-Column Information Boxes
      currentY += 36;
      const colWidth = 240;
      const boxHeight = 160;

      // Left Box: Consignee Details
      doc.rect(50, currentY, colWidth, boxHeight).lineWidth(0.8).stroke('#cbd5e1');
      doc.rect(50, currentY, colWidth, 24).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold')
        .text('CONSIGNEE (CUSTOMER DETAILS)', 60, currentY + 7);

      let leftY = currentY + 32;
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('Customer Name:', 60, leftY);
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(entry.customer_name || '-', 150, leftY, { width: 130 });

      leftY += 24;
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('Mobile Number:', 60, leftY);
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica').text(entry.customer_phone || '-', 150, leftY);

      leftY += 22;
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('Destination City:', 60, leftY);
      doc.fillColor('#1e40af').fontSize(9).font('Helvetica-Bold').text((entry.transport_city || '-').toUpperCase(), 150, leftY, { width: 130 });

      leftY += 24;
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('Address:', 60, leftY);
      doc.fillColor('#334155').fontSize(8).font('Helvetica').text(entry.customer_address || 'As per booking records', 150, leftY, { width: 130 });

      if (entry.invoice_no) {
        leftY += 28;
        doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('Invoice Ref:', 60, leftY);
        doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(`INV/#${entry.invoice_no}`, 150, leftY);
      }

      // Right Box: Carrier & Booking Info
      const rightX = 305;
      doc.rect(rightX, currentY, colWidth, boxHeight).lineWidth(0.8).stroke('#cbd5e1');
      doc.rect(rightX, currentY, colWidth, 24).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold')
        .text('CARRIER & BOOKING INFO', rightX + 10, currentY + 7);

      let rightY = currentY + 32;
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('Transport Name:', rightX + 10, rightY);
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text((entry.transport_name || '-').toUpperCase(), rightX + 110, rightY, { width: 130 });

      rightY += 24;
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('LR / GC Number:', rightX + 10, rightY);
      // Highlight LR Number
      doc.rect(rightX + 110, rightY - 2, 110, 18).fill('#fef08a').stroke('#eab308');
      doc.fillColor('#0f172a').fontSize(9.5).font('Helvetica-Bold').text(entry.lr_no || 'N/A', rightX + 115, rightY + 2);

      rightY += 26;
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('Booking Date:', rightX + 10, rightY);
      doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica').text(formatDateSafe(entry.booking_date), rightX + 110, rightY);

      rightY += 22;
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('No. of Parcels:', rightX + 10, rightY);
      const parcelText = `${entry.parcels || 1} ${Number(entry.parcels) > 1 ? 'Bundles / Boxes' : 'Bundle / Box'}`;
      doc.fillColor('#1e40af').fontSize(8.5).font('Helvetica-Bold').text(parcelText, rightX + 110, rightY);

      if (entry.remarks) {
        rightY += 22;
        doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('Remarks:', rightX + 10, rightY);
        doc.fillColor('#475569').fontSize(8).font('Helvetica-Oblique').text(entry.remarks, rightX + 110, rightY, { width: 125 });
      }

      // 4. Important Instructions Section
      currentY += boxHeight + 20;
      doc.rect(50, currentY, 495, 80).fill('#fffbeb').stroke('#fde68a');
      doc.fillColor('#b45309').fontSize(9).font('Helvetica-Bold')
        .text('IMPORTANT CONSIGNEE INSTRUCTIONS:', 65, currentY + 10);

      doc.fillColor('#78350f').fontSize(8).font('Helvetica')
        .text('1. Please carry your original ID proof and this LR Number when collecting goods from the transport office.', 65, currentY + 26)
        .text(`2. Verify the parcel condition and count (${entry.parcels || 1} units) before acknowledging receipt.`, 65, currentY + 40)
        .text(`3. For tracking help or inquiries, contact Vela Agencies Support: ${phone1} / ${phone2}`, 65, currentY + 54);

      // 5. Watermark in Center
      if (hasLocalLogo) {
        doc.save();
        doc.opacity(0.06);
        doc.image(localLogoPath, 160, 480, { width: 260 });
        doc.restore();
      }

      // 6. Bottom Reference Strip
      currentY = 765;
      doc.moveTo(40, currentY).lineTo(555, currentY).lineWidth(0.8).stroke('#cbd5e1');
      doc.fontSize(7.5).font('Helvetica').fillColor('#94a3b8')
        .text(`DOC-ID: TRP-${String(entry.id).padStart(5, '0')}`, 50, currentY + 12)
        .text(`LR: ${entry.lr_no || 'N/A'}`, 240, currentY + 12, { align: 'center', width: 120 })
        .text('VELA AGENCIES SIVAKASI', 380, currentY + 12, { align: 'right', width: 165 });

      doc.end();
    } catch (err) {
      console.error('Error generating transport slip PDF:', err);
      reject(err);
    }
  });
};

module.exports = generateTransportSlip;
