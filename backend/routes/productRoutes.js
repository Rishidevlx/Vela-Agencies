const express = require('express');
const router = express.Router();
const db = require('../config/db');
const protect = require('../middleware/authMiddleware');
const redis = require('../config/redis');
const PDFDocument = require('pdfkit');
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
    const doc = new PDFDocument({
      margins: { top: 30, bottom: 10, left: 30, right: 30 },
      size: 'A4',
      bufferPages: true
    });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    const contentWidth = doc.page.width - 60; // 535.28 pt

    // 1. Draw Banner Image AT TOP with EXACT height calculation so doc.y is never overlapped
    if (bannerBuffer) {
      try {
        const bannerImg = doc.openImage(bannerBuffer);
        const bannerHeight = Math.min(220, (contentWidth / bannerImg.width) * bannerImg.height);
        doc.image(bannerImg, 30, 25, { width: contentWidth, height: bannerHeight });
        doc.y = 25 + bannerHeight + 12;
      } catch (e) {
        console.error('Error drawing banner:', e);
        doc.y = 35;
      }
    } else if (logoBuffer) {
      try {
        const logoImg = doc.openImage(logoBuffer);
        doc.image(logoImg, (doc.page.width - 90) / 2, 25, { width: 90 });
        doc.y = 125;
      } catch (e) {
        console.error('Error drawing logo:', e);
        doc.y = 35;
      }
    } else {
      doc.y = 35;
    }

    // 2. Draw "VELA AGENCIES OFFICIAL PRICELIST" Cleanly BELOW Banner
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#DC2626').text('VELA AGENCIES', { align: 'center' });
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0F172A').text('OFFICIAL FESTIVE PRICELIST', { align: 'center' });
    doc.fontSize(8.5).font('Helvetica').fillColor('#475569').text(`${shopAddress}  |  Phone: ${contactPhone}  |  ${frontendUrl.replace(/^https?:\/\//, '')}`, { align: 'center' });
    
    // Decorative Red Accent Line Below Header
    doc.moveDown(0.4);
    const lineY = doc.y;
    doc.lineWidth(1.5).strokeColor('#DC2626').moveTo(30, lineY).lineTo(doc.page.width - 30, lineY).stroke();
    doc.y = lineY + 14;

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
    const tableWidth = 535;
    const startX = 30;
    const pageBottomLimit = doc.page.height - 35; // 806 pt

    // Column configurations
    const columns = hasAnyOriginalPrice ? [
      { key: 'sno', label: 'S.No', width: 35, align: 'center' },
      { key: 'name', label: 'Product Name', width: 255, align: 'left' },
      { key: 'unit', label: 'Unit', width: 65, align: 'center' },
      { key: 'orig', label: 'Original Price', width: 90, align: 'center' },
      { key: 'rate', label: 'Discount Price', width: 90, align: 'center' }
    ] : [
      { key: 'sno', label: 'S.No', width: 45, align: 'center' },
      { key: 'name', label: 'Product Name', width: 335, align: 'left' },
      { key: 'unit', label: 'Unit', width: 75, align: 'center' },
      { key: 'rate', label: 'Rate / Price', width: 80, align: 'center' }
    ];

    // Helper to draw table column headers (Yellow festive header)
    const drawTableHeader = () => {
      const headerH = 18;
      const headerY = doc.y;
      let currX = startX;
      
      // 1. Background & Border
      doc.rect(startX, headerY, tableWidth, headerH).fillAndStroke('#FACC15', '#64748B');
      
      // 2. Draw Column Separators and Text with fixed headerY
      columns.forEach((col, idx) => {
        if (idx > 0) {
          doc.lineWidth(0.5).strokeColor('#64748B')
             .moveTo(currX, headerY).lineTo(currX, headerY + headerH).stroke();
        }
        
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0F172A');
        doc.text(col.label, currX + 3, headerY + 4.5, {
          width: col.width - 6,
          align: col.align,
          lineBreak: false
        });
        currX += col.width;
      });
      
      // Set doc.y cleanly to bottom of header
      doc.y = headerY + headerH;
    };

    const slugify = (text) => {
      if (!text) return '';
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };

    // Iterate through categories
    for (const [categoryName, catProducts] of Object.entries(categories)) {
      if (!catProducts || catProducts.length === 0) continue;

      // Ensure space for Category Banner (20pt) + Column Header (17pt) + at least 1 Product Row (16.5pt) = 53.5pt
      if (doc.y + 54 > pageBottomLimit) {
        doc.addPage();
        doc.y = 35;
      }

      // 1. Festive Category Banner
      const catHeaderY = doc.y;
      const catHeaderH = 19;
      doc.rect(startX, catHeaderY, tableWidth, catHeaderH).fillAndStroke('#DC2626', '#991B1B');
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#FFFFFF')
         .text(`  ${categoryName.toUpperCase()} (${catProducts.length} ITEMS)`, startX + 6, catHeaderY + 5, { lineBreak: false });
      
      doc.y = catHeaderY + catHeaderH;

      // 2. Draw Table Header
      drawTableHeader();

      // 3. Draw Product Rows
      catProducts.forEach((p, rowIndex) => {
        const rowH = 16.5;

        // Check if row fits on current page
        if (doc.y + rowH > pageBottomLimit) {
          doc.addPage();
          doc.y = 35;
          drawTableHeader(); // Repeat table header on continuation page
        }

        const rowY = doc.y;
        const isEven = rowIndex % 2 === 0;
        const rowBg = isEven ? '#FFFFFF' : '#F8FAFC';

        // Draw row background
        doc.rect(startX, rowY, tableWidth, rowH).fill(rowBg);

        // Prepare cell data
        const orig = p.original_price ? parseFloat(p.original_price) : 0;
        const curr = parseFloat(p.price) || 0;
        
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

        const cellValues = hasAnyOriginalPrice ? {
          sno: (globalSno++).toString(),
          name: p.name || '',
          unit: parsedUnit,
          orig: orig > 0 ? `Rs. ${orig.toFixed(2)}` : '-',
          rate: `Rs. ${curr.toFixed(2)}`
        } : {
          sno: (globalSno++).toString(),
          name: p.name || '',
          unit: parsedUnit,
          rate: `Rs. ${curr.toFixed(2)}`
        };

        let currX = startX;
        columns.forEach((col, idx) => {
          // Draw cell text
          if (col.key === 'name') {
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A');
            const textY = rowY + 4;
            doc.text(cellValues[col.key], currX + 5, textY, {
              width: col.width - 10,
              align: col.align,
              lineBreak: false,
              ellipsis: true
            });

            // Product clickable link
            const productLink = `${frontendUrl}/product/${slugify(p.name)}`;
            doc.link(currX, rowY, col.width, rowH, productLink);
          } else if (col.key === 'rate') {
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#DC2626');
            doc.text(cellValues[col.key], currX + 3, rowY + 4, {
              width: col.width - 6,
              align: col.align,
              lineBreak: false
            });
          } else if (col.key === 'orig') {
            doc.font('Helvetica').fontSize(8).fillColor('#64748B');
            doc.text(cellValues[col.key], currX + 3, rowY + 4, {
              width: col.width - 6,
              align: col.align,
              lineBreak: false
            });
          } else {
            doc.font('Helvetica').fontSize(8).fillColor('#334155');
            doc.text(cellValues[col.key], currX + 3, rowY + 4, {
              width: col.width - 6,
              align: col.align,
              lineBreak: false
            });
          }

          // Column separator line
          if (idx > 0) {
            doc.lineWidth(0.5).strokeColor('#CBD5E1')
               .moveTo(currX, rowY).lineTo(currX, rowY + rowH).stroke();
          }

          currX += col.width;
        });

        // Row border outline (top, bottom, left, right)
        doc.lineWidth(0.5).strokeColor('#CBD5E1')
           .rect(startX, rowY, tableWidth, rowH).stroke();

        doc.y = rowY + rowH;
      });

      // Margin before next category
      doc.y += 10;
    }

    // Add watermark & footer page numbering to all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Bottom Footer Bar
      const footerY = doc.page.height - 20;
      doc.lineWidth(0.5).strokeColor('#CBD5E1').moveTo(30, footerY - 4).lineTo(doc.page.width - 30, footerY - 4).stroke();
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#64748B')
         .text('Vela Agencies, Sivakasi  |  100% Genuine Sivakasi Crackers  |  Wholesale & Retail', 30, footerY, {
           width: 350,
           align: 'left',
           lineBreak: false
         });
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#64748B')
         .text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 130, footerY, {
           width: 100,
           align: 'right',
           lineBreak: false
         });
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
