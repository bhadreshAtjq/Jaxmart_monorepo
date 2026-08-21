const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryByIdOrSlug,
  getCategoryAttributes,
  createCategory,
  updateCategory,
  addCategoryAttribute,
} = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public category routes
router.get('/', getCategories);
router.get('/:idOrSlug', getCategoryByIdOrSlug);
router.get('/:id/attributes', getCategoryAttributes);

// Admin category management
router.post('/', authenticate, requireAdmin, createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.post('/:id/attributes', authenticate, requireAdmin, addCategoryAttribute);

module.exports = router;
