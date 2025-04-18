const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/beerRecipeController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

// Find recipes by name (wildcard/LIKE)
router.get('/by-name/:name', ctrl.getByName);

module.exports = router;
