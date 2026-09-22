const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const db = require('../config/db');
const protect = require('../middleware/authMiddleware');

// @route   POST /api/admin/login
// @desc    Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    
    if (admins.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   GET /api/admin/profile
// @desc    Get admin profile
router.get('/profile', protect, async (req, res) => {
  try {
    const [admins] = await db.query('SELECT id, name, email, role, created_at FROM admins WHERE id = ?', [req.admin.id]);
    
    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.status(200).json({ success: true, data: admins[0] });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// @route   PUT /api/admin/profile
// @desc    Update admin profile
router.put('/profile', protect, async (req, res) => {
  const { name, email } = req.body;
  try {
    await db.query('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name, email, req.admin.id]);
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// @route   PUT /api/admin/change-password
// @desc    Change admin password
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const [admins] = await db.query('SELECT password FROM admins WHERE id = ?', [req.admin.id]);
    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admins[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, req.admin.id]);
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error changing password' });
  }
});

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    const [productsCount] = await db.query('SELECT COUNT(*) as count FROM products');
    const [categoriesCount] = await db.query('SELECT COUNT(*) as count FROM categories');
    
    let offersCount = [{ count: 0 }];
    try {
      [offersCount] = await db.query('SELECT COUNT(*) as count FROM product_offers');
    } catch (e) {}

    let enquiriesCount = [{ count: 0 }];
    try {
      [enquiriesCount] = await db.query('SELECT COUNT(*) as count FROM whatsapp_enquiries');
    } catch (e) {}
    
    let featuredProductsCount = [{ count: 0 }];
    try {
      [featuredProductsCount] = await db.query('SELECT COUNT(*) as count FROM products WHERE is_top_selling = 1');
    } catch (e) {}

    // Chart Data
    // Initialize monthly arrays
    const monthlyEnquiries = Array(12).fill(0);
    const monthlyProducts = Array(12).fill(0);

    try {
      const [enquiryRows] = await db.query(`
        SELECT MONTH(created_at) as month, COUNT(*) as count 
        FROM whatsapp_enquiries 
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
        GROUP BY MONTH(created_at)
      `);
      enquiryRows.forEach(row => {
        monthlyEnquiries[row.month - 1] = row.count;
      });

      const [productRows] = await db.query(`
        SELECT MONTH(created_at) as month, COUNT(*) as count 
        FROM products 
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
        GROUP BY MONTH(created_at)
      `);
      productRows.forEach(row => {
        monthlyProducts[row.month - 1] = row.count;
      });
    } catch(e) {
      console.error('Error fetching chart data', e);
    }

    res.status(200).json({
      success: true,
      data: {
        totalProducts: productsCount[0].count,
        totalCategories: categoriesCount[0].count,
        totalOffers: offersCount[0].count,
        featuredProducts: featuredProductsCount[0].count,
        totalEnquiries: enquiriesCount[0].count,
        chartData: {
          monthlyEnquiries,
          monthlyProducts
        }
      }
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
});

// @route   POST /api/admin/forgot-password
// @desc    Request OTP for password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin with this email not found' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await db.query('UPDATE admins SET reset_otp = ?, reset_otp_expiry = ? WHERE email = ?', [otp, expiry, email]);

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Defaulting to gmail for standard usage
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Password Reset OTP - AK Crackers',
      text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
});

// @route   POST /api/admin/verify-otp
// @desc    Verify the received OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const [admins] = await db.query('SELECT * FROM admins WHERE email = ? AND reset_otp = ?', [email, otp]);
    if (admins.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const admin = admins[0];
    if (new Date() > new Date(admin.reset_otp_expiry)) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
});

// @route   POST /api/admin/reset-password
// @desc    Reset password using OTP
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const [admins] = await db.query('SELECT * FROM admins WHERE email = ? AND reset_otp = ?', [email, otp]);
    if (admins.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const admin = admins[0];
    if (new Date() > new Date(admin.reset_otp_expiry)) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Clear OTP and update password
    await db.query('UPDATE admins SET password = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = ?', [hashedPassword, email]);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
});

module.exports = router;
