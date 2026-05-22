const express = require('express');
const router = express.Router();
const { getConversations, getMessages, startConversation, getConversationListing } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:id/messages', authenticate, getMessages);
router.get('/conversations/:id/listing', authenticate, getConversationListing);
router.post('/conversations', authenticate, startConversation);

module.exports = router;
