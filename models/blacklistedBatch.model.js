const mongoose = require('mongoose');

const BlacklistedBatchSchema = new mongoose.Schema({
  brewfatherId: { type: String, required: true, unique: true }
});

module.exports = mongoose.models.BlacklistedBatch || mongoose.model('BlacklistedBatch', BlacklistedBatchSchema);
