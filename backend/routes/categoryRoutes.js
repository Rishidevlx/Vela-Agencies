const express = require('express');
const router = express.Router();
const db = require('../config/db');
const protect = require('../middleware/authMiddleware');
const redis = require('../config/redis');

// Helper to invalidate category cache
const invalidateCategoryCache = async () => {
  if (redis) {
    try {
      await redis.del('categories:all');
    } catch (err) {
      console.error('Redis category cache invalidation error:', err);
    }
  }
};

// Get all categories
router.get('/', async (req, res) => {
  try {
    if (redis) {
      try {
        const cachedCategories = await redis.get('categories:all');
        if (cachedCategories) {
          return res.json({ success: true, data: cachedCategories });
        }
      } catch (err) {
        console.error('Redis cache error:', err);
      }
    }

    const [rows] = await db.query('SELECT * FROM categories ORDER BY sort_order ASC, id ASC');
    
    if (redis) {
      await redis.set('categories:all', rows);
    }
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create category (Admin Only)
router.post('/', protect, async (req, res) => {
  try {
    const { name, parent_id, image_url } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Generate a basic slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if slug exists
    const [existing] = await db.query('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // Get max sort_order
    const [maxOrderRow] = await db.query('SELECT MAX(sort_order) as maxOrder FROM categories');
    const sortOrder = (maxOrderRow[0].maxOrder || 0) + 1;

    const [result] = await db.query(
      'INSERT INTO categories (name, slug, parent_id, sort_order, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, slug, parent_id || null, sortOrder, image_url || null]
    );
    
    await invalidateCategoryCache();

    res.status(201).json({ success: true, message: 'Category created', data: { id: result.insertId, name, slug } });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update category (Admin Only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, parent_id, image_url, status } = req.body;
    const categoryId = req.params.id;

    let updateQuery = 'UPDATE categories SET ';
    const queryParams = [];
    
    if (name) {
      let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      updateQuery += 'name = ?, slug = ?, ';
      queryParams.push(name, slug);
    }
    
    if (parent_id !== undefined) {
      updateQuery += 'parent_id = ?, ';
      queryParams.push(parent_id || null);
    }

    if (image_url !== undefined) {
      updateQuery += 'image_url = ?, ';
      queryParams.push(image_url);
    }

    if (status) {
      updateQuery += 'status = ?, ';
      queryParams.push(status);
    }

    // Remove last comma and space
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ' WHERE id = ?';
    queryParams.push(categoryId);

    await db.query(updateQuery, queryParams);
    
    await invalidateCategoryCache();
    
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete category (Admin Only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const categoryId = req.params.id;
    // Check if it has subcategories
    const [subCategories] = await db.query('SELECT id FROM categories WHERE parent_id = ?', [categoryId]);
    if (subCategories.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete category with subcategories' });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);
    
    await invalidateCategoryCache();
    
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Reorder categories (Admin Only)
router.put('/reorder/bulk', protect, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, sort_order }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      for (const item of items) {
        await connection.query('UPDATE categories SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
      }
      
      await connection.commit();
      
      await invalidateCategoryCache();
      
      res.json({ success: true, message: 'Categories reordered' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
