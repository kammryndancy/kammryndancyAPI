const mongoose = require('mongoose');
const BeerRecipe = mongoose.models.BeerRecipe || require('../models/beerRecipe.model');

exports.getAll = async (req, res) => {
  const recipes = await BeerRecipe.find();
  res.json(recipes);
};

exports.getOne = async (req, res) => {
  const recipe = await BeerRecipe.findById(req.params.id);
  if (!recipe) return res.status(404).send('Not found');
  res.json(recipe);
};

exports.create = async (req, res) => {
  const recipe = new BeerRecipe(req.body);
  await recipe.save();
  res.status(201).json(recipe);
};

exports.update = async (req, res) => {
  const recipe = await BeerRecipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!recipe) return res.status(404).send('Not found');
  res.json(recipe);
};

exports.delete = async (req, res) => {
  const recipe = await BeerRecipe.findByIdAndDelete(req.params.id);
  if (!recipe) return res.status(404).send('Not found');
  res.json({ success: true });
};
