const mongoose = require('mongoose');

const scavengerHuntItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'animals', 'plants', 'insects'
  season: { type: String, required: true },   // e.g., 'any', 'spring', 'summer', 'fall', 'winter'
});

scavengerHuntItemSchema.index({ name: 1, category: 1, season: 1 }, { unique: true });

module.exports = mongoose.model('ScavengerHuntItem', scavengerHuntItemSchema);
