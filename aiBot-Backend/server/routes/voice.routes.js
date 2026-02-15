const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { handleVoiceMessage } = require('../controllers/voice.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage

router.use(authenticate);

// Expect 'audio' field in form-data
router.post('/', upload.single('audio'), handleVoiceMessage);

module.exports = router;
