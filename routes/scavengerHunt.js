const express = require('express');
const router = express.Router();
const scavengerHuntController = require('../controllers/scavengerHuntController');

router.get('/', scavengerHuntController.getAllItems);
router.get('/filter', scavengerHuntController.getFilteredItems);
router.get('/:name/:category/:season', scavengerHuntController.getItem);
router.put('/:name/:category/:season', scavengerHuntController.updateItem);
router.post('/', scavengerHuntController.addItem);

module.exports = router;
