const { v4: uuidv4 } = require('uuid');
const ScavengerHunt = require('../models/ScavengerHunt');

// POST /api/persistent-hunt
// Create a new persistent scavenger hunt
exports.createHunt = async (req, res) => {
  try {
    const { finderName, items } = req.body;
    if (!finderName || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'finderName and items are required' });
    }
    const huntId = uuidv4();
    const hunt = await ScavengerHunt.create({ huntId, finderName, items });
    res.status(201).json({ huntId, hunt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/persistent-hunt/:huntId
exports.getHunt = async (req, res) => {
  try {
    const { huntId } = req.params;
    const hunt = await ScavengerHunt.findOne({ huntId });
    if (!hunt) return res.status(404).json({ error: 'Hunt not found' });
    res.json(hunt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/persistent-hunt/:huntId
exports.deleteHunt = async (req, res) => {
  try {
    const { huntId } = req.params;
    await ScavengerHunt.deleteOne({ huntId });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
