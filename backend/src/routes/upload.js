const express = require('express');
const router = express.Router();
const { upload, uploadSingle, uploadMultiple } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth'); // Corrected import

// Protected routes - only logged in users can upload
router.post('/single', authenticate, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('[DEBUG] Multer Error (Single):', err);
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, uploadSingle);

router.post('/multiple', authenticate, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('[DEBUG] Multer Error (Multiple):', err);
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, uploadMultiple);

module.exports = router;
