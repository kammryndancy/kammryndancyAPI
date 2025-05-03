const express = require('express');
const router = express.Router();
const persistentHuntController = require('../controllers/persistentHuntController');

// Create a new persistent scavenger hunt
router.post('/', persistentHuntController.createHunt);

// Get a persistent scavenger hunt by huntId
router.get('/:huntId', persistentHuntController.getHunt);

// Delete a persistent scavenger hunt by huntId
router.delete('/:huntId', persistentHuntController.deleteHunt);

module.exports = router;
