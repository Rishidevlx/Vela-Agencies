const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');
const redis = require('../config/redis');

// Helper to invalidate CMS cache
const invalidateCmsCache = async () => {
  if (redis) {
    try {
      await redis.del('cms:home');
    } catch (err) {
      console.error('Redis CMS cache invalidation error:', err);
    }
  }
};

// @desc    Get Home CMS data (Marquee, Banners)
// @route   GET /api/cms/home
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (redis) {
      try {
        const cachedCms = await redis.get('cms:home');
        if (cachedCms) {
          return res.json({ success: true, data: cachedCms });
        }
      } catch (err) {
        console.error('Redis cache error:', err);
      }
    }

    const [rows] = await pool.query('SELECT cms_key, cms_value FROM home_cms');
    
    // Convert array of rows into a single key-value object
    const cmsData = {};
    rows.forEach(row => {
      cmsData[row.cms_key] = row.cms_value;
    });

    if (redis) {
      await redis.set('cms:home', cmsData);
    }

    res.json({ success: true, data: cmsData });
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update or insert Home CMS data
// @route   POST /api/cms/home
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  const { marquee_text, hero_banners, whatsapp_settings, contact_details, footer_cms, giftbox_settings, general_settings } = req.body;
  
  try {
    const connection = await pool.getConnection();
    
    if (marquee_text !== undefined) {
      await connection.query(
        `INSERT INTO home_cms (cms_key, cms_value) 
         VALUES ('marquee_text', ?) 
         ON DUPLICATE KEY UPDATE cms_value = ?`,
        [JSON.stringify(marquee_text), JSON.stringify(marquee_text)]
      );
    }
    
    if (hero_banners !== undefined) {
      await connection.query(
        `INSERT INTO home_cms (cms_key, cms_value) 
         VALUES ('hero_banners', ?) 
         ON DUPLICATE KEY UPDATE cms_value = ?`,
        [JSON.stringify(hero_banners), JSON.stringify(hero_banners)]
      );
    }

    if (whatsapp_settings !== undefined) {
      await connection.query(
        `INSERT INTO home_cms (cms_key, cms_value) 
         VALUES ('whatsapp_settings', ?) 
         ON DUPLICATE KEY UPDATE cms_value = ?`,
        [JSON.stringify(whatsapp_settings), JSON.stringify(whatsapp_settings)]
      );
    }

    if (contact_details !== undefined) {
      await connection.query(
        `INSERT INTO home_cms (cms_key, cms_value) 
         VALUES ('contact_details', ?) 
         ON DUPLICATE KEY UPDATE cms_value = ?`,
        [JSON.stringify(contact_details), JSON.stringify(contact_details)]
      );
    }

    if (footer_cms !== undefined) {
      await connection.query(
        `INSERT INTO home_cms (cms_key, cms_value) 
         VALUES ('footer_cms', ?) 
         ON DUPLICATE KEY UPDATE cms_value = ?`,
        [JSON.stringify(footer_cms), JSON.stringify(footer_cms)]
      );
    }

    if (giftbox_settings !== undefined) {
      await connection.query(
        `INSERT INTO home_cms (cms_key, cms_value) 
         VALUES ('giftbox_settings', ?) 
         ON DUPLICATE KEY UPDATE cms_value = ?`,
        [JSON.stringify(giftbox_settings), JSON.stringify(giftbox_settings)]
      );
    }

    if (general_settings !== undefined) {
      await connection.query(
        `INSERT INTO home_cms (cms_key, cms_value) 
         VALUES ('general_settings', ?) 
         ON DUPLICATE KEY UPDATE cms_value = ?`,
        [JSON.stringify(general_settings), JSON.stringify(general_settings)]
      );
    }

    connection.release();
    
    await invalidateCmsCache();
    
    res.json({ success: true, message: 'Home page content updated successfully' });
  } catch (error) {
    console.error('Error updating CMS data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
