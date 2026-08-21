const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createDeal, getDeals, getDealById } = require('../controllers/dealController');

router.use(authenticate);

router.post('/', createDeal);
router.get('/', getDeals);
router.get('/:id', getDealById);

module.exports = router;
