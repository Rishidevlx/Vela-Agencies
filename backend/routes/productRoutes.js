const express = require('express');
const router = express.Router();
const db = require('../config/db');
const protect = require('../middleware/authMiddleware');
const redis = require('../config/redis');
const PDFDocument = require('pdfkit-table');
const https = require('https');

// Helper to invalidate caches
const invalidateCaches = async () => {
  if (redis) {
    try {
      await redis.del('products:all');
      await redis.del('products:all_admin');
      await redis.del('products:top-selling');
      await redis.del('pricelist:pdf');
    } catch (err) {
      console.error('Redis cache invalidation error:', err);
    }
  }
};

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  const {
    name,
    description,
    category_id,
    original_price,
    price,
    unit,
    main_image,
    sub_images,
    status
  } = req.body;

  try {
    const query = `
      INSERT INTO products (
        name, description, category_id, original_price, price, unit, main_image, sub_images, status, moq
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      description ? JSON.stringify(description) : null,
      category_id || null,
      original_price || null,
      price,
      unit ? JSON.stringify(unit) : null,
      main_image || null,
      sub_images ? JSON.stringify(sub_images) : null,
      status || 'active',
      req.body.moq ? parseInt(req.body.moq) : 1
    ];

    const [result] = await db.query(query, values);

    await invalidateCaches();

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        category_id,
        price
      },
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    require('fs').writeFileSync('debug_error.log', error.stack || error.toString());
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/products/bulk-update-offers
// @desc    Bulk update product offers
// @access  Private (Admin)
router.put('/bulk-update-offers', protect, async (req, res) => {
  try {
    const { offers } = req.body;
    if (!Array.isArray(offers)) {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const offer of offers) {
        const { id, offer_price, offer_moq, is_offer_active, offer_start_date, offer_end_date } = offer;
        
        await connection.query(`
          UPDATE products 
          SET 
            offer_price = ?, 
            offer_moq = ?,
            is_offer_active = ?, 
            offer_start_date = ?, 
            offer_end_date = ?
          WHERE id = ?
        `, [
          offer_price || null,
          offer_moq ? parseInt(offer_moq) : 1, 
          is_offer_active ? 1 : 0, 
          offer_start_date || null, 
          offer_end_date || null, 
          id
        ]);
      }
      
      await connection.commit();
      connection.release();
      
      await invalidateCaches();
      
      res.json({ success: true, message: 'Offers updated successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error bulk updating offers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/products/top-selling
// @desc    Update top selling products
// @access  Private (Admin)
router.put('/top-selling', protect, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ success: false, message: 'productIds must be an array' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Reset all
      await connection.query('UPDATE products SET is_top_selling = FALSE, top_selling_order = 0');
      
      // Update selected
      if (productIds.length > 0) {
        for (let i = 0; i < productIds.length; i++) {
          await connection.query('UPDATE products SET is_top_selling = TRUE, top_selling_order = ? WHERE id = ?', [i, productIds[i]]);
        }
      }
      
      await connection.commit();
      connection.release();
      
      await invalidateCaches();
      
      res.json({ success: true, message: 'Top selling products updated successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error updating top selling products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/products/bulk-status
// @desc    Update status of multiple products
// @access  Private (Admin)
// IMPORTANT: This route must be placed before /:id to prevent express from matching "bulk-status" as an ID
router.put('/bulk-status', protect, async (req, res) => {
  const { ids, status } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid product IDs' });
  }

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const query = `UPDATE products SET status = ? WHERE id IN (${placeholders})`;
    const values = [status, ...ids];
    
    await db.query(query, values);
    
    await invalidateCaches();
    
    res.json({ success: true, message: `Products marked as ${status}` });
  } catch (error) {
    console.error('Error updating product statuses:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category_id,
    original_price,
    price,
    unit,
    main_image,
    sub_images,
    status
  } = req.body;

  try {
    const query = `
      UPDATE products SET 
        name = ?, description = ?, category_id = ?, original_price = ?, price = ?, 
        unit = ?, main_image = ?, sub_images = ?, status = ?, moq = ?
      WHERE id = ?
    `;

    const values = [
      name,
      description ? JSON.stringify(description) : null,
      category_id || null,
      original_price || null,
      price,
      unit ? JSON.stringify(unit) : null,
      main_image || null,
      sub_images ? JSON.stringify(sub_images) : null,
      status || 'active',
      req.body.moq ? parseInt(req.body.moq) : 1,
      id
    ];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await invalidateCaches();

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/products/pricelist/download
// @desc    Download dynamic PDF pricelist
// @access  Public
router.get('/pricelist/download', async (req, res) => {
  try {
    let frontendUrl = process.env.FRONTEND_URL || 'https://www.velaagencies.com';
    if (req.headers.origin) {
      frontendUrl = req.headers.origin;
    } else if (req.headers.referer) {
      try {
        frontendUrl = new URL(req.headers.referer).origin;
      } catch (e) {}
    }

    const fetchImageBufferSafe = (url) => {
      return new Promise((resolve) => {
        if (!url) return resolve(null);
        const client = url.startsWith('https') ? require('https') : require('http');
        client.get(url, (res) => {
          if (res.statusCode !== 200) return resolve(null);
          const data = [];
          res.on('data', (chunk) => data.push(chunk));
          res.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', () => resolve(null));
      });
    };

    // 2. Fetch all active products ordered by category sort_order, category name, product name
    const [products] = await db.query(`
      SELECT p.*, c.name as category_name, c.sort_order as cat_order
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY COALESCE(c.sort_order, 999) ASC, COALESCE(c.name, 'zzz') ASC, p.id ASC
    `);

    // Fetch logo, banner, and contact info from CMS
    let logoBuffer = null;
    let bannerBuffer = null;
    let contactPhone = '+91 73053 27400';
    let shopAddress = 'Sivakasi, Tamil Nadu, India';

    try {
      const [cmsRows] = await db.query(`SELECT cms_key, cms_value FROM home_cms`);
      const cmsData = {};
      cmsRows.forEach(row => {
        try {
          cmsData[row.cms_key] = JSON.parse(row.cms_value);
        } catch(e) {
          cmsData[row.cms_key] = row.cms_value;
        }
      });

      const logoUrl = cmsData.general_settings?.logo_url;
      if (logoUrl) {
        logoBuffer = await fetchImageBufferSafe(logoUrl.replace('f_auto', 'f_jpg').replace('.webp', '.jpg'));
      }
      
      const banners = cmsData.hero_banners;
      if (banners && banners.length > 0) {
        bannerBuffer = await fetchImageBufferSafe(banners[0].replace('f_auto', 'f_jpg').replace('.webp', '.jpg'));
      }

      if (cmsData.contact_details) {
        contactPhone = cmsData.contact_details.phone1 || cmsData.contact_details.phone || contactPhone;
        shopAddress = cmsData.contact_details.address || shopAddress;
      }
    } catch (err) {
      console.error('Error fetching CMS images:', err);
    }

    // 3. Generate PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    const contentWidth = doc.page.width - 60; // 535.28 pt

    // 1. Draw Banner Image AT TOP (Moved to the very top as requested)
    if (bannerBuffer) {
      try {
        doc.image(bannerBuffer, 30, 25, { width: contentWidth });
        doc.moveDown(0.5);
      } catch (e) {
        console.error('Error drawing banner:', e);
      }
    } else if (logoBuffer) {
      try {
        doc.image(logoBuffer, (doc.page.width - 90) / 2, 25, { width: 90 });
        doc.moveDown(0.5);
      } catch (e) {
        console.error('Error drawing logo:', e);
      }
    }

    // 2. Draw "VELA AGENCIES OFFICIAL PRICELIST" BELOW Banner
    doc.moveDown(0.8);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#B45309').text('VELA AGENCIES', { align: 'center' });
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1E293B').text('OFFICIAL FESTIVE PRICELIST', { align: 'center' });
    doc.fontSize(8.5).font('Helvetica').fillColor('#64748B').text(`${shopAddress} | Phone/WhatsApp: ${contactPhone} | ${frontendUrl.replace(/^https?:\/\//, '')}`, { align: 'center' });
    
    // Decorative Accent Line
    doc.moveDown(0.5);
    const lineY = doc.y;
    doc.lineWidth(1.5).strokeColor('#F59E0B').moveTo(30, lineY).lineTo(doc.page.width - 30, lineY).stroke();
    doc.moveDown(0.8);

    // Check if any product has an original price
    const hasAnyOriginalPrice = products.some(p => p.original_price && parseFloat(p.original_price) > 0);

    // Group products by category maintaining order
    const categories = {};
    products.forEach(p => {
      const cat = p.category_name || 'General Crackers';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(p);
    });

    let globalSno = 1;

    for (const [categoryName, catProducts] of Object.entries(categories)) {
      // Check page break for category header
      if (doc.y > doc.page.height - 120) {
        doc.addPage();
      }

      // Attractive Category Header Banner Bar
      const catHeaderY = doc.y;
      doc.rect(30, catHeaderY, contentWidth, 22).fill('#1E3A8A'); // Royal Blue Bar
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text(`  ${categoryName.toUpperCase()} (${catProducts.length} ITEMS)`, 35, catHeaderY + 6);
      doc.y = catHeaderY + 26;

      const tableData = catProducts.map((p) => {
        const orig = p.original_price ? parseFloat(p.original_price) : 0;
        const curr = parseFloat(p.price);
        
        let parsedUnit = 'packet';
        if (p.unit) {
          try {
            const u = typeof p.unit === 'string' ? JSON.parse(p.unit) : p.unit;
            if (Array.isArray(u) && u.length > 0) parsedUnit = u[0];
            else if (typeof u === 'string') parsedUnit = u;
          } catch (e) {
            parsedUnit = p.unit;
          }
        }

        if (hasAnyOriginalPrice) {
          return [
            (globalSno++).toString(),
            p.name,
            parsedUnit,
            orig > 0 ? `Rs. ${orig.toFixed(2)}` : '-',
            `Rs. ${curr.toFixed(2)}`
          ];
        } else {
          // Remove Original Price column completely if no original price exists
          return [
            (globalSno++).toString(),
            p.name,
            parsedUnit,
            `Rs. ${curr.toFixed(2)}`
          ];
        }
      });

      const tableHeaders = hasAnyOriginalPrice ? [
        { label: 'S.No', width: 35, headerColor: '#FACC15', headerOpacity: 1, align: 'center' },
        { label: 'Product Name', width: 255, headerColor: '#FACC15', headerOpacity: 1, align: 'left' },
        { label: 'Unit', width: 65, headerColor: '#FACC15', headerOpacity: 1, align: 'center' },
        { label: 'Original Price', width: 90, headerColor: '#FACC15', headerOpacity: 1, align: 'center' },
        { label: 'Discount Price', width: 90, headerColor: '#FACC15', headerOpacity: 1, align: 'center' }
      ] : [
        { label: 'S.No', width: 45, headerColor: '#FACC15', headerOpacity: 1, align: 'center' },
        { label: 'Product Name', width: 335, headerColor: '#FACC15', headerOpacity: 1, align: 'left' },
        { label: 'Unit', width: 75, headerColor: '#FACC15', headerOpacity: 1, align: 'center' },
        { label: 'Rate / Price', width: 80, headerColor: '#FACC15', headerOpacity: 1, align: 'center' }
      ];

      const table = {
        headers: tableHeaders,
        rows: tableData
      };

      await doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0F172A'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1E293B');
          
          // Product Name click-through link
          if (indexColumn === 1) {
            const prod = catProducts[indexRow];
            if (prod) {
              const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
              const productLink = `${frontendUrl}/product/${slugify(prod.name)}`;
              doc.link(rectCell.x, rectCell.y, rectCell.width, rectCell.height, productLink);
              doc.fillColor('#1D4ED8'); // Clean Blue link color
            }
          }
          
          // Crisp, professional cell borders
          doc.lineWidth(0.5).strokeColor('#94A3B8');
          // Vertical right border
          doc.moveTo(rectCell.x + rectCell.width, rectCell.y).lineTo(rectCell.x + rectCell.width, rectCell.y + rectCell.height).stroke();
          // Vertical left border on first column
          if (indexColumn === 0) {
            doc.moveTo(rectCell.x, rectCell.y).lineTo(rectCell.x, rectCell.y + rectCell.height).stroke();
          }
          // Horizontal bottom border
          doc.moveTo(rectCell.x, rectCell.y + rectCell.height).lineTo(rectCell.x + rectCell.width, rectCell.y + rectCell.height).stroke();
        },
        padding: 4
      });

      doc.moveDown(0.5);
    }

    // Add watermark & footer page numbering to all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Background Watermark
      if (logoBuffer) {
        doc.save();
        doc.opacity(0.06);
        try {
          doc.image(logoBuffer, (doc.page.width - 260) / 2, (doc.page.height - 260) / 2, { width: 260 });
        } catch (e) {}
        doc.restore();
      }

      // Bottom Footer Bar
      const footerY = doc.page.height - 22;
      doc.lineWidth(0.5).strokeColor('#CBD5E1').moveTo(30, footerY - 5).lineTo(doc.page.width - 30, footerY - 5).stroke();
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#64748B')
         .text('Vela Agencies, Sivakasi  |  100% Genuine Sivakasi Crackers  |  Wholesale & Retail', 30, footerY, { width: 350, align: 'left' });
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#64748B')
         .text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 130, footerY, { width: 100, align: 'right' });
    }
    
    doc.end();

    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="vela agencies pricelist.pdf"');
      res.send(pdfData);
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const cacheKey = isAdmin ? 'products:all_admin' : 'products:all';

    if (redis) {
      try {
        const cachedProducts = await redis.get(cacheKey);
        if (cachedProducts) {
          return res.json({ success: true, data: cachedProducts });
        }
      } catch (err) {
        console.error('Redis cache error:', err);
      }
    }

    const query = isAdmin 
      ? `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC`
      : `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 'active' ORDER BY p.created_at DESC`;

    const [rows] = await db.query(query);
    
    if (redis) {
      await redis.set(cacheKey, rows);
    }
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/products/top-selling
// @desc    Get top selling products
// @access  Public
router.get('/top-selling', async (req, res) => {
  try {
    if (redis) {
      try {
        const cachedTopSelling = await redis.get('products:top-selling');
        if (cachedTopSelling) {
          return res.json({ success: true, data: cachedTopSelling });
        }
      } catch (err) {
        console.error('Redis cache error:', err);
      }
    }

    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_top_selling = TRUE AND p.status = 'active'
      ORDER BY p.top_selling_order ASC
    `);
    
    if (redis) {
      await redis.set('products:top-selling', rows);
    }
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/products/:idOrSlug
// @desc    Get product by ID or Slug
// @access  Public
router.get('/:idOrSlug', async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    
    const slugify = (text) => {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };

    let product = null;

    if (!isNaN(param)) {
      const [rows] = await db.query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `, [param]);
      if (rows.length > 0) product = rows[0];
    }
    
    if (!product) {
      const [allRows] = await db.query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
      `);
      product = allRows.find(p => slugify(p.name) === param);
    }
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/products/bulk-category
// @desc    Update category for multiple products
// @access  Private (Admin)
router.put('/bulk-category', protect, async (req, res) => {
  const { ids, category_id } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid product IDs' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const query = `UPDATE products SET category_id = ? WHERE id IN (${placeholders})`;
    
    await db.query(query, [category_id || null, ...ids]);
    
    await invalidateCaches();
    
    res.json({ success: true, message: `${ids.length} product(s) category updated successfully` });
  } catch (error) {
    console.error('Error bulk updating product categories:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   DELETE /api/products/bulk
// @desc    Delete multiple products
// @access  Private (Admin)
router.delete('/bulk', protect, async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid product IDs' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM products WHERE id IN (${placeholders})`;
    
    await db.query(query, ids);
    
    await invalidateCaches();
    
    res.json({ success: true, message: 'Products deleted successfully' });
  } catch (error) {
    console.error('Error deleting products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product by ID
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    await invalidateCaches();
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
