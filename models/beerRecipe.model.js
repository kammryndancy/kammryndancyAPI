const mongoose = require('mongoose');

const AwardSchema = new mongoose.Schema({
  name: String,
  competition: String,
  year: Number,
  place: String
}, { _id: false });

const BeerRecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  youtubeUrl: String,
  imageUrl: String,
  recipeUrl: String,
  malts: [String],
  hops: [String],
  yeast: [String],
  adjuncts: [String],
  abv: Number,
  og: Number,
  fg: Number,
  srm: Number,
  ibu: Number,
  buGu: Number,
  description: String,
  awards: [AwardSchema],
  brewfatherId: String,
  userPriority: { type: Number, default: 3, index: true }
});

module.exports = mongoose.models.BeerRecipe || mongoose.model('BeerRecipe', BeerRecipeSchema);
