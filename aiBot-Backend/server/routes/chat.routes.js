const { Router } = require('express');
const { sendMessage, getChatHistory, chatValidation } = require('../controllers/chat.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.post('/', chatValidation, sendMessage);
router.get('/:botId/history', getChatHistory);

module.exports = router;
