const express = require('express');
const router = express.Router();
const { getCategories, getCategoryAttributes } = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/:id/attributes', getCategoryAttributes);

module.exports = router;
