const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');
const generateInvoice = require('../utils/generateInvoice');

// @desc    Create a new WhatsApp enquiry
// @route   POST /api/enquiries/whatsapp
// @access  Public
router.post('/whatsapp', async (req, res) => {
  const { 
    mobile_number, 
    cart_data, 
    customer_name, 
    address, 
    city, 
    pincode 
  } = req.body;

  if (!mobile_number) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Generate Enquiry Number (Sequential)
    const [rows] = await connection.query('SELECT IFNULL(MAX(enquiry_no), 0) + 1 AS next_no FROM whatsapp_enquiries WHERE enquiry_no < 100000');
    const enquiry_no = rows[0].next_no;
    
    // Format full address
    let full_address = address || '';
    if (city) full_address += `, ${city}`;
    if (pincode) full_address += ` - ${pincode}`;
    
    // Fetch Settings & Contact Details from CMS
    let gst_number = '';
    let logo_url = '';
    let contact_details = {};
    
    const [cmsRows] = await connection.query("SELECT cms_key, cms_value FROM home_cms WHERE cms_key IN ('general_settings', 'contact_details')");
    
    cmsRows.forEach(row => {
      if (row.cms_key === 'general_settings' && row.cms_value) {
        try {
          const settings = typeof row.cms_value === 'string' ? JSON.parse(row.cms_value) : row.cms_value;
          gst_number = settings.gst_number || '';
          logo_url = settings.logo_url || '';
        } catch (e) {
          console.error('Error parsing general_settings', e);
        }
      }
      if (row.cms_key === 'contact_details' && row.cms_value) {
        try {
          contact_details = typeof row.cms_value === 'string' ? JSON.parse(row.cms_value) : row.cms_value;
        } catch (e) {
          console.error('Error parsing contact_details', e);
        }
      }
    });

    // Prepare data for invoice
    const enquiryData = {
      enquiry_no,
      customer_name,
      mobile_number,
      address,
      city,
      pincode,
      cart_data,
      gst_number,
      logo_url,
      contact_details
    };

    // Generate Invoice PDF & Upload to Cloudinary
    let invoice_url = null;
    try {
      invoice_url = await generateInvoice(enquiryData);
    } catch (pdfErr) {
      console.error('Failed to generate or upload invoice PDF:', pdfErr);
      // We continue even if PDF fails, but we won't have the URL
    }

    // Insert into Database
    const query = `
      INSERT INTO whatsapp_enquiries 
      (mobile_number, cart_data, customer_name, customer_address, enquiry_no, invoice_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.query(query, [
      mobile_number, 
      JSON.stringify(cart_data || {}),
      customer_name || null,
      full_address || null,
      enquiry_no,
      invoice_url
    ]);
    
    connection.release();
    res.status(201).json({ 
      success: true, 
      message: 'Enquiry saved successfully',
      enquiry_no,
      invoice_url
    });
  } catch (error) {
    console.error('Error saving whatsapp enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error while saving enquiry' });
  }
});

// @desc    Get all WhatsApp enquiries
// @route   GET /api/enquiries/whatsapp
// @access  Private (Admin)
router.get('/whatsapp', protect, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM whatsapp_enquiries ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching whatsapp enquiries:', error);
    res.status(500).json({ success: false, message: 'Server error fetching enquiries' });
  }
});

// @desc    Update WhatsApp enquiry status
// @route   PUT /api/enquiries/whatsapp/:id/status
// @access  Private (Admin)
router.put('/whatsapp/:id/status', protect, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['New', 'Connected', 'Enquiry Success'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const [result] = await pool.query('UPDATE whatsapp_enquiries SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating whatsapp enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// @desc    Delete WhatsApp enquiry
// @route   DELETE /api/enquiries/whatsapp/:id
// @access  Private (Admin)
router.delete('/whatsapp/:id', protect, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM whatsapp_enquiries WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting whatsapp enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error deleting enquiry' });
  }
});

// @desc    Bulk Delete WhatsApp enquiries
// @route   POST /api/enquiries/whatsapp/bulk-delete
// @access  Private (Admin)
router.post('/bulk-delete', protect, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty IDs array' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.query(`DELETE FROM whatsapp_enquiries WHERE id IN (${placeholders})`, ids);
    res.json({ success: true, message: `${result.affectedRows} enquiries deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting whatsapp enquiries:', error);
    res.status(500).json({ success: false, message: 'Server error bulk deleting enquiries' });
  }
});

// @desc    Bulk Update WhatsApp enquiry status
// @route   POST /api/enquiries/whatsapp/bulk-status
// @access  Private (Admin)
router.post('/bulk-status', protect, async (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty IDs array' });
  }
  if (!['New', 'Connected', 'Enquiry Success'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.query(`UPDATE whatsapp_enquiries SET status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
    res.json({ success: true, message: `${result.affectedRows} enquiries updated successfully` });
  } catch (error) {
    console.error('Error bulk updating whatsapp enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server error bulk updating status' });
  }
});

module.exports = router;
