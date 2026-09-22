const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');
const generateTransportSlip = require('../utils/generateTransportSlip');

// Ensure Table Exists Helper
const ensureTransportTable = async (connection) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS transport_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no VARCHAR(100),
      transport_name VARCHAR(255) NOT NULL,
      transport_city VARCHAR(255) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_address TEXT,
      lr_no VARCHAR(100),
      parcels INT DEFAULT 1,
      booking_date DATE,
      status VARCHAR(50) DEFAULT 'Pending',
      remarks TEXT,
      slip_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await connection.query(createTableQuery);

  // Ensure slip_url column exists if table was created previously without it
  try {
    await connection.query("ALTER TABLE transport_entries ADD COLUMN slip_url VARCHAR(500)");
  } catch (err) {
    // Column already exists, ignore
  }
};

// @desc    Get all transport entries
// @desc    Get all transport entries
// @route   GET /api/transport
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureTransportTable(connection);

    const { status, search, from_date, to_date } = req.query;
    let query = `
      SELECT id, invoice_no, transport_name, transport_city, customer_name, 
             customer_phone, customer_address, lr_no, parcels, 
             DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, 
             status, remarks, created_at, updated_at 
      FROM transport_entries 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      if (status.toLowerCase() === 'pending') {
        query += ' AND (status = "Pending" OR status = "In Transit" OR status = "Dispatched")';
      } else if (status.toLowerCase() === 'finished' || status.toLowerCase() === 'reached' || status.toLowerCase() === 'delivered') {
        query += ' AND (status = "Finished" OR status = "Reached" OR status = "Delivered")';
      } else {
        query += ' AND status = ?';
        params.push(status);
      }
    }

    if (search) {
      query += ' AND (invoice_no LIKE ? OR transport_name LIKE ? OR transport_city LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR lr_no LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }

    if (from_date) {
      query += ' AND booking_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND booking_date <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY booking_date DESC, id DESC';

    const [rows] = await connection.query(query, params);
    connection.release();

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching transport entries:', error);
    res.status(500).json({ success: false, message: 'Server error fetching transport entries' });
  }
});

// @desc    Lookup customer / bill details by invoice number
// @route   GET /api/transport/lookup/:invoiceNo
// @access  Private (Admin)
router.get('/lookup/:invoiceNo', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const rawInvoice = (req.params.invoiceNo || '').trim();
    const numericPart = parseInt(rawInvoice.replace(/\D/g, '')) || null;

    // Try finding in outward_bills by bill_no, numeric bill_no, id, or like
    const [bills] = await connection.query(
      `SELECT bill_no, DATE_FORMAT(bill_date, '%Y-%m-%d') as bill_date, customer_name, phone_number, address, city, grand_total, total_items 
       FROM outward_bills 
       WHERE bill_no = ? OR (bill_no = ? AND ? IS NOT NULL) OR (id = ? AND ? IS NOT NULL) OR bill_no LIKE ? 
       ORDER BY id DESC LIMIT 1`,
      [rawInvoice, numericPart, numericPart, numericPart, numericPart, `%${rawInvoice}%`]
    );

    connection.release();

    if (bills.length > 0) {
      const bill = bills[0];
      return res.json({
        success: true,
        data: {
          invoice_no: bill.bill_no || rawInvoice,
          customer_name: bill.customer_name || '',
          customer_phone: bill.phone_number || '',
          customer_address: bill.address || '',
          transport_city: bill.city || '',
          booking_date: bill.bill_date || new Date().toISOString().split('T')[0],
          parcels: 1
        }
      });
    }

    res.json({ success: false, message: 'No bill found for this invoice number' });
  } catch (error) {
    console.error('Error looking up invoice:', error);
    res.status(500).json({ success: false, message: 'Server error looking up invoice' });
  }
});

// @desc    Get single transport entry
// @route   GET /api/transport/:id
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureTransportTable(connection);
    const [rows] = await connection.query(
      `SELECT id, invoice_no, transport_name, transport_city, customer_name, 
              customer_phone, customer_address, lr_no, parcels, 
              DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, 
              status, remarks, created_at, updated_at 
       FROM transport_entries WHERE id = ?`, 
      [req.params.id]
    );
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transport entry not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching transport entry:', error);
    res.status(500).json({ success: false, message: 'Server error fetching transport entry' });
  }
});

// @desc    Create new transport entry
// @route   POST /api/transport
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  try {
    const {
      invoice_no,
      transport_name,
      transport_city,
      customer_name,
      customer_phone,
      customer_address,
      lr_no,
      parcels,
      booking_date,
      status,
      remarks
    } = req.body;

    if (!transport_name || !transport_city || !customer_name || !customer_phone) {
      return res.status(400).json({
        success: false,
        message: 'Transport Name, City, Customer Name, and Customer Phone are required'
      });
    }

    const connection = await pool.getConnection();
    await ensureTransportTable(connection);

    const insertQuery = `
      INSERT INTO transport_entries (
        invoice_no, transport_name, transport_city, customer_name, customer_phone,
        customer_address, lr_no, parcels, booking_date, status, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const formattedDate = booking_date 
      ? booking_date.toString().split('T')[0] 
      : new Date().toISOString().split('T')[0];

    const [result] = await connection.query(insertQuery, [
      invoice_no || '',
      transport_name.trim(),
      transport_city.trim(),
      customer_name.trim(),
      customer_phone.trim(),
      customer_address || '',
      lr_no || '',
      parcels ? parseInt(parcels) : 1,
      formattedDate,
      status || 'Pending',
      remarks || ''
    ]);

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Transport entry created successfully',
      data: { id: result.insertId, ...req.body, booking_date: formattedDate }
    });
  } catch (error) {
    console.error('Error creating transport entry:', error);
    res.status(500).json({ success: false, message: 'Server error creating transport entry' });
  }
});

// @desc    Update transport entry
// @route   PUT /api/transport/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const {
      invoice_no,
      transport_name,
      transport_city,
      customer_name,
      customer_phone,
      customer_address,
      lr_no,
      parcels,
      booking_date,
      status,
      remarks
    } = req.body;

    const connection = await pool.getConnection();
    await ensureTransportTable(connection);

    const updateQuery = `
      UPDATE transport_entries SET
        invoice_no = ?,
        transport_name = ?,
        transport_city = ?,
        customer_name = ?,
        customer_phone = ?,
        customer_address = ?,
        lr_no = ?,
        parcels = ?,
        booking_date = ?,
        status = ?,
        remarks = ?
      WHERE id = ?
    `;

    const formattedDate = booking_date 
      ? booking_date.toString().split('T')[0] 
      : new Date().toISOString().split('T')[0];

    const [result] = await connection.query(updateQuery, [
      invoice_no || '',
      transport_name.trim(),
      transport_city.trim(),
      customer_name.trim(),
      customer_phone.trim(),
      customer_address || '',
      lr_no || '',
      parcels ? parseInt(parcels) : 1,
      formattedDate,
      status || 'Pending',
      remarks || '',
      req.params.id
    ]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Transport entry not found' });
    }

    res.json({ success: true, message: 'Transport entry updated successfully' });
  } catch (error) {
    console.error('Error updating transport entry:', error);
    res.status(500).json({ success: false, message: 'Server error updating transport entry' });
  }
});

// @desc    Quick status update
// @route   PATCH /api/transport/:id/status
// @access  Private (Admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const connection = await pool.getConnection();
    await ensureTransportTable(connection);

    const [result] = await connection.query(
      'UPDATE transport_entries SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Transport entry not found' });
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// @desc    Generate Transport Slip PDF and upload to Cloudinary for WhatsApp
// @route   POST /api/transport/:id/whatsapp-slip
// @access  Private (Admin)
router.post('/:id/whatsapp-slip', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureTransportTable(connection);

    const [rows] = await connection.query(
      "SELECT id, invoice_no, transport_name, transport_city, customer_name, customer_phone, customer_address, lr_no, parcels, DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, status, remarks, slip_url FROM transport_entries WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Transport entry not found' });
    }

    const entry = rows[0];

    // Fetch CMS store contact details
    let storeDetails = {};
    try {
      const [cmsRows] = await connection.query("SELECT cms_value FROM home_cms WHERE cms_key = 'contact_details'");
      if (cmsRows.length > 0 && cmsRows[0].cms_value) {
        storeDetails = typeof cmsRows[0].cms_value === 'string' ? JSON.parse(cmsRows[0].cms_value) : cmsRows[0].cms_value;
      }
    } catch (e) {
      console.error('Error fetching CMS details:', e);
    }

    // Generate PDF & upload to Cloudinary
    const slip_url = await generateTransportSlip(entry, storeDetails);

    // Save slip_url in database
    try {
      await connection.query('UPDATE transport_entries SET slip_url = ? WHERE id = ?', [slip_url, req.params.id]);
    } catch (e) {
      console.error('Error saving slip_url in DB:', e);
    }

    connection.release();

    res.json({
      success: true,
      message: 'Transport slip generated successfully',
      data: {
        ...entry,
        slip_url,
        storeDetails
      }
    });
  } catch (error) {
    console.error('Error generating WhatsApp transport slip:', error);
    res.status(500).json({ success: false, message: 'Failed to generate transport slip PDF' });
  }
});

// @desc    Delete transport entry
// @route   DELETE /api/transport/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureTransportTable(connection);

    const [result] = await connection.query('DELETE FROM transport_entries WHERE id = ?', [req.params.id]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Transport entry not found' });
    }

    res.json({ success: true, message: 'Transport entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting transport entry:', error);
    res.status(500).json({ success: false, message: 'Server error deleting transport entry' });
  }
});

module.exports = router;
