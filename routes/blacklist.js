const express = require('express');
const router = express.Router();
const blacklistController = require('../controllers/blacklistController');
const auth = require('../middleware/auth');

// Public GET route (no auth)
router.get('/', blacklistController.getBlacklist);

// Protected routes (require auth)
router.post('/', auth, blacklistController.addToBlacklist);
router.delete('/:brewfatherId', auth, blacklistController.removeFromBlacklist);

module.exports = router;
