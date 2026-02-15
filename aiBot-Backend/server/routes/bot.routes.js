const { Router } = require('express');
const { createBot, getAllBots, deleteBot, editBot, createBotValidation } = require('../controllers/bot.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = Router();

// Protect all bot routes with authentication
router.use(authenticate);

// Admin-only routes for bot management
router.post('/', requireRole('admin'), createBotValidation, createBot);
router.put('/:botId', requireRole('admin'), createBotValidation, editBot);
router.delete('/:id', requireRole('admin'), deleteBot);

// Users can list available bots
router.get('/', getAllBots);

module.exports = router;
