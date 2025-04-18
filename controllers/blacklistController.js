const BlacklistedBatch = require('../models/blacklistedBatch.model');

// Get all blacklisted batch ids
exports.getBlacklist = async (req, res) => {
  const ids = await BlacklistedBatch.find({}, { _id: 0, brewfatherId: 1 });
  res.json(ids.map(x => x.brewfatherId));
};

// Add a batch id to the blacklist
exports.addToBlacklist = async (req, res) => {
  const { brewfatherId } = req.body;
  if (!brewfatherId) return res.status(400).json({ error: 'brewfatherId required' });
  try {
    await BlacklistedBatch.create({ brewfatherId });
    res.status(201).json({ message: 'Added to blacklist', brewfatherId });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'Already blacklisted' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// Remove a batch id from the blacklist
exports.removeFromBlacklist = async (req, res) => {
  const { brewfatherId } = req.params;
  const result = await BlacklistedBatch.deleteOne({ brewfatherId });
  if (result.deletedCount === 0) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.json({ message: 'Removed from blacklist', brewfatherId });
  }
};
