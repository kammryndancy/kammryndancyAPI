const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/beerRecipeController');
const auth = require('../middleware/auth');

// Public GET routes (no auth)
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/by-name/:name', ctrl.getByName);

// Protected routes (require auth)
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.delete);

module.exports = router;
