const express = require('express');
const router = express.Router();
const scavengerHuntController = require('../controllers/scavengerHuntController');
const auth = require('../middleware/auth');

// Public GET routes (no auth)
router.get('/', scavengerHuntController.getAllItems);
router.get('/filter', scavengerHuntController.getFilteredItems);
router.get('/:name/:category/:season', scavengerHuntController.getItem);

// Protected routes (require auth)
router.put('/:name/:category/:season', auth, scavengerHuntController.updateItem);
router.post('/', auth, scavengerHuntController.addItem);

module.exports = router;
