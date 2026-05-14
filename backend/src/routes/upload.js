const express = require('express');
const router = express.Router();
const { upload, uploadSingle, uploadMultiple } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth'); // Corrected import

// Protected routes - only logged in users can upload
router.post('/single', authenticate, upload.single('image'), uploadSingle);
router.post('/multiple', authenticate, upload.array('images', 5), uploadMultiple);

module.exports = router;
