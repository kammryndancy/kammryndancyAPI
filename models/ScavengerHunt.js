const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new Schema({
  name: String,
  description: String,
  image: String,
  category: String,
  completed: Boolean
});

const ScavengerHuntSchema = new Schema({
  huntId: { type: String, unique: true, required: true },
  finderName: { type: String, required: true },
  items: [ItemSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScavengerHunt', ScavengerHuntSchema);
