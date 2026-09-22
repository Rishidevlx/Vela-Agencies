const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');
const generateInvoice = require('../utils/generateInvoice');

// Ensure Table Exists Helper
const ensureTable = async (connection) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS outward_bills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bill_no INT UNIQUE,
      bill_date DATE,
      customer_name VARCHAR(255),
      phone_number VARCHAR(50),
      address TEXT,
      city VARCHAR(100),
      pincode VARCHAR(20),
      items JSON,
      subtotal DECIMAL(10,2) DEFAULT 0.00,
      discount DECIMAL(10,2) DEFAULT 0.00,
      grand_total DECIMAL(10,2) DEFAULT 0.00,
      total_items INT DEFAULT 0,
      invoice_url TEXT,
      payment_mode VARCHAR(50) DEFAULT 'Cash',
      status VARCHAR(50) DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await connection.query(createTableQuery);
};

// @desc    Get all outward bills
// @route   GET /api/billing
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureTable(connection);
    const [rows] = await connection.query('SELECT * FROM outward_bills ORDER BY id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching outward bills:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bills' });
  }
});

// @desc    Get single outward bill
// @route   GET /api/billing/:id
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureTable(connection);
    const [rows] = await connection.query('SELECT * FROM outward_bills WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching single bill:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bill' });
  }
});

// @desc    Create new outward bill
// @route   POST /api/billing
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  const {
    bill_date,
    customer_name,
    phone_number,
    address,
    city,
    pincode,
    items,
    discount = 0,
    payment_mode = 'Cash'
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one product item is required' });
  }

  try {
    const connection = await pool.getConnection();
    await ensureTable(connection);

    // Calculate subtotal and total items
    let subtotal = 0;
    let total_items = 0;
    const formattedCartData = items.map(item => {
      const price = parseFloat(item.price) || 0;
      const originalPrice = parseFloat(item.original_price || item.originalPrice || price);
      const quantity = parseInt(item.quantity) || 1;
      const lineTotal = price * quantity;
      
      subtotal += lineTotal;
      total_items += quantity;

      return {
        id: item.id || item.product_id,
        name: item.name,
        price,
        originalPrice,
        quantity,
        unit: item.unit || 'packet',
        image: item.image || item.main_image || null
      };
    });

    const parsedDiscount = parseFloat(discount) || 0;
    const grand_total = Math.max(0, subtotal - parsedDiscount);

    // Get Next Sequential Bill No
    const [numRows] = await connection.query('SELECT IFNULL(MAX(bill_no), 0) + 1 AS next_no FROM outward_bills');
    const bill_no = numRows[0].next_no || 1;

    // Fetch CMS settings (GST & Contact)
    let gst_number = '';
    let logo_url = '';
    let contact_details = {};

    try {
      const [cmsRows] = await connection.query("SELECT cms_key, cms_value FROM home_cms WHERE cms_key IN ('general_settings', 'contact_details')");
      cmsRows.forEach(row => {
        if (row.cms_key === 'general_settings' && row.cms_value) {
          try {
            const settings = typeof row.cms_value === 'string' ? JSON.parse(row.cms_value) : row.cms_value;
            gst_number = settings.gst_number || '';
            logo_url = settings.logo_url || '';
          } catch (e) {}
        }
        if (row.cms_key === 'contact_details' && row.cms_value) {
          try {
            contact_details = typeof row.cms_value === 'string' ? JSON.parse(row.cms_value) : row.cms_value;
          } catch (e) {}
        }
      });
    } catch (e) {}

    // Prepare invoice data for PDFKit
    const invoicePayload = {
      enquiry_no: bill_no,
      customer_name: customer_name || 'Walk-in Customer',
      mobile_number: phone_number || 'N/A',
      address: address || '',
      city: city || '',
      pincode: pincode || '',
      cart_data: formattedCartData,
      gst_number,
      logo_url,
      contact_details
    };

    // Generate Invoice PDF
    let invoice_url = null;
    try {
      invoice_url = await generateInvoice(invoicePayload);
    } catch (pdfErr) {
      console.error('Invoice PDF generation failed:', pdfErr);
    }

    const effectiveDate = bill_date || new Date().toISOString().split('T')[0];

    // Insert into outward_bills
    const insertQuery = `
      INSERT INTO outward_bills 
      (bill_no, bill_date, customer_name, phone_number, address, city, pincode, items, subtotal, discount, grand_total, total_items, invoice_url, payment_mode, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [insertResult] = await connection.query(insertQuery, [
      bill_no,
      effectiveDate,
      customer_name || 'Walk-in Customer',
      phone_number || '',
      address || '',
      city || '',
      pincode || '',
      JSON.stringify(formattedCartData),
      subtotal,
      parsedDiscount,
      grand_total,
      total_items,
      invoice_url,
      payment_mode,
      'Completed'
    ]);

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Outward bill created successfully',
      data: {
        id: insertResult.insertId,
        bill_no,
        bill_date: effectiveDate,
        customer_name,
        grand_total,
        invoice_url
      }
    });
  } catch (error) {
    console.error('Error creating outward bill:', error);
    res.status(500).json({ success: false, message: 'Server error creating bill', error: error.message });
  }
});

// @desc    Update existing outward bill
// @route   PUT /api/billing/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  const {
    bill_date,
    customer_name,
    phone_number,
    address,
    city,
    pincode,
    items,
    discount = 0,
    payment_mode = 'Cash'
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one product item is required' });
  }

  try {
    const connection = await pool.getConnection();
    await ensureTable(connection);

    // Check existing bill
    const [existingRows] = await connection.query('SELECT * FROM outward_bills WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const existingBill = existingRows[0];
    const bill_no = existingBill.bill_no;

    // Calculate subtotal and total items
    let subtotal = 0;
    let total_items = 0;
    const formattedCartData = items.map(item => {
      const price = parseFloat(item.price) || 0;
      const originalPrice = parseFloat(item.original_price || item.originalPrice || price);
      const quantity = parseInt(item.quantity) || 1;
      const lineTotal = price * quantity;
      
      subtotal += lineTotal;
      total_items += quantity;

      return {
        id: item.id || item.product_id || item.productId,
        name: item.name,
        price,
        originalPrice,
        quantity,
        unit: item.unit || 'packet',
        image: item.image || item.main_image || null
      };
    });

    const parsedDiscount = parseFloat(discount) || 0;
    const grand_total = Math.max(0, subtotal - parsedDiscount);

    // Fetch CMS settings (GST & Contact)
    let gst_number = '';
    let logo_url = '';
    let contact_details = {};

    try {
      const [cmsRows] = await connection.query("SELECT cms_key, cms_value FROM home_cms WHERE cms_key IN ('general_settings', 'contact_details')");
      cmsRows.forEach(row => {
        if (row.cms_key === 'general_settings' && row.cms_value) {
          try {
            const settings = typeof row.cms_value === 'string' ? JSON.parse(row.cms_value) : row.cms_value;
            gst_number = settings.gst_number || '';
            logo_url = settings.logo_url || '';
          } catch (e) {}
        }
        if (row.cms_key === 'contact_details' && row.cms_value) {
          try {
            contact_details = typeof row.cms_value === 'string' ? JSON.parse(row.cms_value) : row.cms_value;
          } catch (e) {}
        }
      });
    } catch (e) {}

    // Prepare invoice data for PDFKit
    const invoicePayload = {
      enquiry_no: bill_no,
      customer_name: customer_name || 'Walk-in Customer',
      mobile_number: phone_number || 'N/A',
      address: address || '',
      city: city || '',
      pincode: pincode || '',
      cart_data: formattedCartData,
      gst_number,
      logo_url,
      contact_details
    };

    // Generate Invoice PDF
    let invoice_url = existingBill.invoice_url;
    try {
      invoice_url = await generateInvoice(invoicePayload);
    } catch (pdfErr) {
      console.error('Invoice PDF generation failed:', pdfErr);
    }

    const effectiveDate = bill_date || existingBill.bill_date;

    // Update query
    const updateQuery = `
      UPDATE outward_bills 
      SET bill_date = ?, customer_name = ?, phone_number = ?, address = ?, city = ?, pincode = ?, 
          items = ?, subtotal = ?, discount = ?, grand_total = ?, total_items = ?, invoice_url = ?, payment_mode = ?
      WHERE id = ?
    `;

    await connection.query(updateQuery, [
      effectiveDate,
      customer_name || 'Walk-in Customer',
      phone_number || '',
      address || '',
      city || '',
      pincode || '',
      JSON.stringify(formattedCartData),
      subtotal,
      parsedDiscount,
      grand_total,
      total_items,
      invoice_url,
      payment_mode,
      req.params.id
    ]);

    connection.release();

    res.json({
      success: true,
      message: 'Outward bill updated successfully',
      data: {
        id: req.params.id,
        bill_no,
        bill_date: effectiveDate,
        customer_name,
        grand_total,
        invoice_url
      }
    });
  } catch (error) {
    console.error('Error updating outward bill:', error);
    res.status(500).json({ success: false, message: 'Server error updating bill', error: error.message });
  }
});

// @desc    Delete outward bill
// @route   DELETE /api/billing/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureTable(connection);
    const [result] = await connection.query('DELETE FROM outward_bills WHERE id = ?', [req.params.id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ success: false, message: 'Server error deleting bill' });
  }
});

// @desc    Bulk delete outward bills
// @route   POST /api/billing/bulk-delete
// @access  Private (Admin)
router.post('/bulk-delete', protect, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty IDs array' });
  }

  try {
    const connection = await pool.getConnection();
    await ensureTable(connection);
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await connection.query(`DELETE FROM outward_bills WHERE id IN (${placeholders})`, ids);
    connection.release();
    res.json({ success: true, message: `${result.affectedRows} bills deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting bills:', error);
    res.status(500).json({ success: false, message: 'Server error bulk deleting bills' });
  }
});

module.exports = router;
